import fs from "fs";
import path from "path";

export default function readDirRecursive(dirPath: string) {
  const files = fs.readdirSync(dirPath);
  let filePaths: any[] = [];

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      filePaths = filePaths.concat(readDirRecursive(filePath));
    } else if (stats.isFile()) {
      filePaths.push(filePath);
    }
  });

  return filePaths;
}
