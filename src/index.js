// const linkedIn = require('linkedin-jobs-api');
// const fs = require("fs/promises");
// const puppeteer =require( 'puppeteer');
// const queryOptions = {
//   keyword: 'Full Stack',
//   location: 'Kiryat Ono',
//   dateSincePosted: 'past Week',
//   jobType: 'full time',
// //   remoteFilter: 'hybrid',
//   experienceLevel: 'entry level',
// //   limit: '100',
//   sortBy:"relevant",
// //   host:"heys"

// };

// (async () => {
// try {

//     let data = await linkedIn.query(queryOptions)
// console.log(data.length);
//  await fs.writeFile("data1.json",JSON.stringify(data),"utf-8")
// //   const browser = await puppeteer.launch({headless: false, args: [
// //     '--incognito',
// //   ],});
// const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
// // if(data)
// // {const browser = await puppeteer.launch({headless:false});
// // const context = await browser.createIncognitoBrowserContext();

// //   const page = await context.newPage();
// // for(let i=0; i<data.length;i++){

// //     await page.goto(data[i].jobUrl);
// //       // Set screen size
// //   await page.setViewport({width: 1080, height: 1024});
// //     // Fetches page's title
// //     const title = await page.title();
// //     console.log(title)
// // const res=await page.evaluate(()=>{
// //    const t= document.querySelector(".show-more-less-html__markup")
// // return t.textContent
// // })

// // console.log(res);
// // // const desc= await page.waitForSelector('core-section-container__title section-title');
// // // console.log(desc);
// // await delay(5000)
// // console.log(i);
// // }

// // }
// // await context?.close();
// } catch (error) {
//  console.log(error);
// }
// })();
