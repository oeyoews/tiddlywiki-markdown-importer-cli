import fs from 'fs';
import path from 'path';

export default function readDirRecursive(dirPath: string) {
  const files = fs.readdirSync(dirPath);
  let fileData: { filename: string; filetype: string; filePath: string }[] = [];

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      fileData = fileData.concat(readDirRecursive(filePath));
    } else if (stats.isFile()) {
      fileData.push({
        filename: path.parse(file).name,
        filetype: path.parse(file).ext,
        filePath: filePath,
      });
    }
  });

  return fileData;
}
