import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  //await createCurrencies();
}

async function createCurrencies() {
  const currencies = [
    "AED", "ALL", "ARS", "AUD", "BAM", "BHD", "BGN", "BOB", "BRL", "BYR",
    "CAD", "CHF", "CLP", "CNY", "COP", "CRC", "CSD", "CZK", "DKK", "DOP",
    "DZD", "EEK", "EGP", "EUR", "GBP", "GTQ", "HKD", "HNL", "HRK", "HUF",
    "IDR", "ILS", "INR", "IQD", "ISK", "JOD", "JPY", "KRW", "KWD", "LBP",
    "LTL", "LVL", "LYD", "MAD", "MKD", "MXN", "MYR", "NIO", "NOK", "NZD",
    "OMR", "PAB", "PEN", "PHP", "PLN", "PYG", "QAR", "RON", "RSD", "RUB",
    "SAR", "SDG", "SEK", "SGD", "SKK", "SVC", "SYP", "THB", "TND", "TRY",
    "TWD", "UAH", "USD", "UYU", "VEF", "VND", "YER", "ZAR"
  ];

  for (const currency of currencies) {
    await prisma.currency.create({
      data: {
        currency,
      },
    });
  }
}


main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });