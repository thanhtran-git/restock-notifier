import axios from "axios";
import * as cheerio from "cheerio";
import { sendEmail } from "./emailer.js";

export async function checkStock({ url, targetSize, name }) {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(html);
    const sizeList = $('div[data-dropdown="list"] ul li');

    let found = false;
    let sizes = [];

    sizeList.each((_, el) => {
      const input = $(el).find("input[type='radio']");
      const label = $(el).find("label").text().trim().replace(/\s+/g, " ");
      const isDisabled = input.is(":disabled");

      sizes.push(`${label}${isDisabled ? " (sold out)" : ""}`);

      if (label === targetSize && !isDisabled) {
        found = true;
      }
    });

    console.log(`🔍 Checked: ${name}`);
    console.log("Sizes:", sizes);

    if (found) {
      const message = `👟 Your size ${targetSize} is back in stock for "${name}"!\n${url}`;
      console.log(
        `✅ Size ${targetSize} available for ${name}. Sending email...`
      );
      await sendEmail(`👟 In Stock: ${name}`, message);
    } else {
      console.log(
        `❌ Size ${targetSize} still sold out for ${name}. 🕐 ${new Date().toLocaleString()}`
      );
    }
  } catch (err) {
    console.error(`❌ Error checking ${name}:`, err.message);
  }
}
