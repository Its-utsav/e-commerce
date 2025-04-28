import { writeFile } from "fs/promises"
import { open } from 'node:fs/promises';
/**
 * 
 * @param {string} line 
 */
const clearLine = (line) => {
    const key = line.split("=")[0];
    return key ? `${key}=\n` : null
}

const read = async (fileName, targetFile) => {
    try {
        const file = await open(fileName);
        let data = []
        for await (const line of file.readLines()) {
            const processLine = clearLine(line)
            if (processLine) data.push(processLine);
        }

        await writeFile(targetFile, data.join(""), "utf-8")
    } catch (error) {
        console.error("Error reading or writing files:", error);
    }
}

const main = async () => {
    await read(".env", ".env.sample");
}
main()