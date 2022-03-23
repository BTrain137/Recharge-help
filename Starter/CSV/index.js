import { readFile } from "fs/promises";
import dotenv from "dotenv";
import neatCsv from "neat-csv";

dotenv.config();

const fileLocation = "./data/fruit_data_with_colours.csv";

const main = async () => {
  const data = await readFile(new URL(fileLocation, import.meta.url));
  const csvArr = await neatCsv(data);
  for (let i = 0; i < csvArr.length; i++) {
    console.log(`Row #${i}`, csvArr[i]);
  }
};

main();
