import { NextResponse, NextRequest } from "next/server";
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/libs/prisma';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { FileUploadStatus, RecordStatus } from "@prisma/client";
import { record } from "zod";

// Configure the AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

interface S3UploadResult {
  Bucket: string;
  Key: string;
  Location: string;
  // Add other fields from S3's response as needed
}

export async function POST(req: NextRequest) {
  let uploadedFiles: S3UploadResult[] = [];

  const formData = await req.formData();

  const role = formData.get('role') as string;
  const address = formData.get('rentalAddress') as string;
  const securityDepositAmount = parseInt(formData.get('securityDeposit') as string);
  const securityDepositCurrency = formData.get('currency') as string;
  const otherEmail = formData.get('otherPartyEmail') as string;
  const totalCredits = parseInt(formData.get('totalCredits') as string);
  const totalVideoSeconds = parseInt(formData.get('totalVideoSeconds') as string);

  const images = formData.getAll('image') as File[];
  const videos = formData.getAll('video') as File[];

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // User who are not logged in can't make a purchase
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    if (!role || !address || !securityDepositAmount || isNaN(securityDepositAmount) || !securityDepositCurrency ||
      !otherEmail || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(otherEmail) || !totalCredits || isNaN(totalCredits) || images.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await prisma.$transaction(async (prisma) => {
      // Create a new record first
      const record = await prisma.record.create({
        data: {
          userId: session.user.id,
          role: role,
          rentalAddress: address,
          securityDeposit: securityDepositAmount,
          currency: securityDepositCurrency,
          otherPartyEmail: otherEmail,
          creditsCharged: totalCredits,
          totalSeconds: totalVideoSeconds,
          numImages: images.length,
          numVideos: videos.length,
        },
      });

      // Decrease the user's available credits
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          availableCredits: {
            decrement: totalCredits,
          },
        },
      });

      if (user.availableCredits < 0) {
        throw new Error('Sorry, you have insufficient credits.');
      }

      // Update the record status to indicate all files are uploaded
      await prisma.record.update({
        where: {
          id: record.id,
          userId: session.user.id
        },
        data: {
          status: RecordStatus.UPLOADED_TO_S3,
        },
      });

      for (let i = 0; i < images.length; i++) {
        // For testing, intentionally throw an error during the third image upload
        // if (i === 2) {
        //   throw new Error('Intentional error');
        // }

        const result = await uploadFile(images[i], 'images');
        uploadedFiles.push(result);

        // Create a file entry in the database
        await prisma.file.create({
          data: {
            recordId: record.id,
            fileName: images[i].name,
            fileExtension: images[i].type.split('/')[1],
            s3Key: result.Key,
            s3Location: result.Location,
            type: 'IMAGE',
            uploadStatus: FileUploadStatus.UPLOADED_TO_S3,
          },
        });
      }

      for (let i = 0; i < videos.length; i++) {
        // For testing, intentionally throw an error during the second video upload
        // if (i === 1) {
        //   throw new Error('Intentional video error');
        // }

        const result = await uploadFile(videos[i], 'videos');
        uploadedFiles.push(result);

        // Create a file entry in the database
        await prisma.file.create({
          data: {
            recordId: record.id,
            fileName: videos[i].name,
            fileExtension: videos[i].type.split('/')[1],
            s3Key: result.Key,
            s3Location: result.Location,
            type: 'VIDEO',
            uploadStatus: FileUploadStatus.UPLOADED_TO_S3,
          },
        });
      }

      return uploadedFiles;
    });

    return NextResponse.json({ status: 200 });
  } catch (e) {
    console.error(e);

    const count = images.length + videos.length;

    if (uploadedFiles.length < count) {
      console.log("Partial image upload failure");
      // If there was a partial image upload failure, delete all uploaded images
      await deleteFiles(uploadedFiles);
    }

    return NextResponse.json({ error: "Uploading failed, please try again." }, { status: 500 });
  }
}

const uploadFile = async (file: File, folder: string) => {
  const fileStream = file.stream();
  const fileKey = `${folder}/${uuidv4()}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
    Body: fileStream,
    ContentType: file.type,
  };

  const upload = new Upload({
    client: s3Client,
    params: uploadParams,
  });

  await upload.done();

  return {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
    Location: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
  };
};

// If an error occurs, delete all successfully uploaded objects
const deleteFiles = async (files: S3UploadResult[]) => {
  for (const file of files) {
    try {
      const deleteParams = {
        Bucket: file.Bucket,
        Key: file.Key,
      };
      const command = new DeleteObjectCommand(deleteParams);
      await s3Client.send(command);
      console.log(`Deleted object ${file.Key} from bucket ${file.Bucket}`);
    } catch (deleteError) {
      console.error(`Failed to delete object ${file.Key} from bucket ${file.Bucket}:`, deleteError);
    }
  }
};






// image, video separate upload
// import { NextResponse, NextRequest } from "next/server";
// import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
// import { Upload } from '@aws-sdk/lib-storage';
// import { v4 as uuidv4 } from 'uuid';
// import prisma from '@/libs/prisma';
// import { cookies } from "next/headers";
// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { FileUploadStatus, RecordStatus } from "@prisma/client";
// import { record } from "zod";

// // Configure the AWS S3 client
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// interface S3UploadResult {
//   Bucket: string;
//   Key: string;
//   Location: string;
//   // Add other fields from S3's response as needed
// }

// export async function POST(req: NextRequest) {
//   let uploadedImages: S3UploadResult[] = [];
//   let uploadedVideos: S3UploadResult[] = [];
//   let recordId: bigint;

//   const formData = await req.formData();

//   const role = formData.get('role') as string;
//   const address = formData.get('rentalAddress') as string;
//   const securityDepositAmount = parseInt(formData.get('securityDeposit') as string);
//   const securityDepositCurrency = formData.get('currency') as string;
//   const otherEmail = formData.get('otherPartyEmail') as string;
//   const totalCredits = parseInt(formData.get('totalCredits') as string);
//   const totalVideoSeconds = parseInt(formData.get('totalVideoSeconds') as string);

//   const images = formData.getAll('image') as File[];
//   const videos = formData.getAll('video') as File[];

//   const imageCreditCharged = images.length;
//   const videoCreditCharged = totalVideoSeconds;

//   try {
//     const cookieStore = cookies();
//     const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

//     const {
//       data: { session },
//     } = await supabase.auth.getSession();

//     // User who are not logged in can't make a purchase
//     if (!session) {
//       return NextResponse.json(
//         { error: "You must be logged in." },
//         { status: 401 }
//       );
//     }

//     if (!role || !address || !securityDepositAmount || isNaN(securityDepositAmount) || !securityDepositCurrency ||
//       !otherEmail || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(otherEmail) || !totalCredits || isNaN(totalCredits) || images.length === 0) {
//       return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
//     }

//     const uploadFile = async (file: File, folder: string) => {
//       const fileStream = file.stream();
//       const fileKey = `${folder}/${uuidv4()}`;

//       const uploadParams = {
//         Bucket: process.env.AWS_S3_BUCKET_NAME,
//         Key: fileKey,
//         Body: fileStream,
//         ContentType: file.type,
//       };

//       const upload = new Upload({
//         client: s3Client,
//         params: uploadParams,
//       });

//       await upload.done();

//       return {
//         Bucket: process.env.AWS_S3_BUCKET_NAME,
//         Key: fileKey,
//         Location: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
//       };
//     };

//     // Start a transaction for uploading images and updating user's credits
//     await prisma.$transaction(async (prisma) => {
//       // Create a new record first
//       const record = await prisma.record.create({
//         data: {
//           userId: session.user.id,
//           role: role,
//           rentalAddress: address,
//           securityDeposit: securityDepositAmount,
//           currency: securityDepositCurrency,
//           otherPartyEmail: otherEmail,
//           creditsCharged: totalCredits,
//           actualCreditCharge: totalCredits,
//           totalSeconds: totalVideoSeconds,
//           numImages: images.length,
//           numVideos: videos.length,
//         },
//       });

//       // Decrease the user's available credits
//       await prisma.user.update({
//         where: { id: session.user.id },
//         data: {
//           availableCredits: {
//             decrement: imageCreditCharged, // note that we only decrement charges for images up until here
//           },
//         },
//       });

//       // Update the record status to indicate all files are uploaded
//       await prisma.record.update({
//         where: {
//           id: record.id,
//         },
//         data: {
//           status: RecordStatus.UPLOADED_TO_S3,
//         },
//       });

//       for (let i = 0; i < images.length; i++) {
//         // For testing, intentionally throw an error during the third image upload
//         // if (i === 2) {
//         //   throw new Error('Intentional error');
//         // }

//         const result = await uploadFile(images[i], 'images');
//         uploadedImages.push(result);

//         // Create a file entry in the database
//         await prisma.file.create({
//           data: {
//             recordId: record.id,
//             fileName: images[i].name,
//             fileExtension: images[i].type.split('/')[1],
//             s3Key: result.Key,
//             s3Location: result.Location,
//             type: 'IMAGE',
//             uploadStatus: FileUploadStatus.UPLOADED_TO_S3,
//           },
//         });
//       }

//       recordId = record.id;

//       return uploadedImages;
//     });

//     if (videos.length > 0) {
//       // Start a transaction for uploading videos
//       await prisma.$transaction(async (prisma) => {
//         // Decrease the user's available credits
//         await prisma.user.update({
//           where: { id: session.user.id },
//           data: {
//             availableCredits: {
//               decrement: videoCreditCharged,
//             },
//           },
//         });

//         for (let i = 0; i < videos.length; i++) {
//           // For testing, intentionally throw an error during the second video upload
//           if (i === 1) {
//             throw new Error('Intentional error');
//           }

//           const result = await uploadFile(videos[i], 'videos');
//           uploadedVideos.push(result);

//           // Create a file entry in the database
//           await prisma.file.create({
//             data: {
//               recordId: recordId,
//               fileName: videos[i].name,
//               fileExtension: videos[i].type.split('/')[1],
//               s3Key: result.Key,
//               s3Location: result.Location,
//               type: 'VIDEO',
//               uploadStatus: FileUploadStatus.UPLOADED_TO_S3,
//             },
//           });
//         }

//         return uploadedVideos;
//       });
//     }

//     return NextResponse.json({ status: 200 });
//   } catch (e) {
//     console.error(e);

//     // If an error occurs, delete all successfully uploaded objects
//     const deleteFiles = async (files: S3UploadResult[]) => {
//       for (const file of files) {
//         try {
//           const deleteParams = {
//             Bucket: file.Bucket,
//             Key: file.Key,
//           };
//           const command = new DeleteObjectCommand(deleteParams);
//           await s3Client.send(command);
//           console.log(`Deleted object ${file.Key} from bucket ${file.Bucket}`);
//         } catch (deleteError) {
//           console.error(`Failed to delete object ${file.Key} from bucket ${file.Bucket}:`, deleteError);
//         }
//       }
//     };

//     // Determine which files to delete
//     if (uploadedImages.length < images.length) {
//       console.log("Partial image upload failure");
//       // If there was a partial image upload failure, delete all uploaded images
//       await deleteFiles(uploadedImages);
//     }

//     if (uploadedVideos.length < videos.length) {
//       console.log("Partial video upload failure");
//       // up until here, image upload was successful
//       // need to update credit charge and status
//       console.log({ recordId })
//       console.log({ imageCreditCharged })
//       await prisma.record.update({
//         where: { id: recordId },
//         data: {
//           actualCreditCharge: imageCreditCharged,
//           status: RecordStatus.FAILED_VIDEO_UPLOAD
//         },
//       });
//       // If there was a partial video upload failure, delete all uploaded videos
//       await deleteFiles(uploadedVideos);
//     }

//     return NextResponse.json({ error: e.message }, { status: 500 });
//   }
// }












// CLOUDINARY WAY
// import { NextResponse, NextRequest } from "next/server";
// import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });

// interface CloudinaryUploadResult {
//   public_id: string;
//   url: string;
//   // Add other fields from Cloudinary's response as needed
// }

// export async function POST(req: NextRequest) {
//   let uploadedResults: CloudinaryUploadResult[] = [];

//   try {
//     const formData = await req.formData();
//     const files = formData.getAll('file') as Blob[];

//     if (files.length === 0) {
//       return NextResponse.json({ error: 'No files provided' }, { status: 400 });
//     }

//     const uploadPromises = files.map((file: File) => {
//       return new Promise<CloudinaryUploadResult>((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           { resource_type: 'image' },
//           (error, result) => {
//             if (error) {
//               console.error(`Error uploading file ${file.name}:`, error);
//               // save the file name to db
//               return reject(new Error(`Error uploading file ${file.name}: ${error.message}`));
//             }
//             resolve(result as CloudinaryUploadResult);
//           }
//         );

//         const reader = file.stream().getReader();
//         const pump = () => reader.read().then(({ done, value }) => {
//           if (done) {
//             uploadStream.end();
//             return;
//           }
//           uploadStream.write(value);
//           pump();
//         });
//         pump();
//       }).then(result => {
//         uploadedResults.push(result);
//         return result;
//       });
//     });

//     const uploadResults = await Promise.all(uploadPromises);
//     console.log({ uploadResults });
//     // add it to each Image row
//     return NextResponse.json(uploadResults, { status: 200 });
//   } catch (e) {
//     console.error(e);

//     // If an error occurs, delete all successfully uploaded images
//     for (const uploaded of uploadedResults) {
//       try {
//         await cloudinary.uploader.destroy(uploaded.public_id, { resource_type: 'image' });
//       } catch (deleteError) {
//         // add to db
//         console.error(`Failed to delete image ${uploaded.public_id}:`, deleteError);
//       }
//     }

//     return NextResponse.json({ error: e.message }, { status: 500 });
//   }
// }
