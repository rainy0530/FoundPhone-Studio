import { copyFile } from "node:fs/promises";
for (const name of ["LICENSE", "THIRD_PARTY_LICENSES.txt", "BRAND_NOTICE.txt"])
  await copyFile(name, "dist/" + name);
console.log("Runtime license notices included.");

await copyFile("src/vendor/mymy/NOTICE.txt", "dist/MYMY_NOTICE.txt");

const memoPhotos = [
  "IMG_2378.jpeg",
  "IMG_2379.jpeg",
  "IMG_2376.jpeg",
  "b8e5330a3b54d29a24800329a6c12bb4.jpeg",
  "IMG_2387.jpeg",
  "IMG_2377.jpeg",
  "IMG_2375.jpeg",
  "IMG_2373.jpeg",
];
for (const name of memoPhotos) await copyFile(name, "dist/" + name);
console.log(`Memo photos included: ${memoPhotos.length}`);
