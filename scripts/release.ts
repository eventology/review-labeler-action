/* eslint-disable no-console */
import { exec } from "child_process"
import { promises as fs } from "fs"
import inquirer from "inquirer"
import semver from "semver"
import pkg from "../package.json"

async function getValidNewVersion(): Promise<string> {
  const { newVersion } = await inquirer.prompt([
    { type: "input", name: "newVersion", message: "New version?" },
  ])

  if (semver.valid(newVersion)) {
    return newVersion
  }

  console.info(
    `Invalid version "${newVersion}", must be a valid semver version`,
  )

  return getValidNewVersion()
}

function execWithOutput(command: string) {
  return new Promise((resolve, reject) => {
    const child = exec(command)
    child.stdout?.pipe(process.stdout)
    child.stderr?.pipe(process.stderr)

    child.on("close", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`"${command}" exited with code ${code}`))
      }
    })

    child.on("error", reject)
  })
}

async function main() {
  console.info(`Current version: ${pkg.version}`)

  const newVersion = await getValidNewVersion()
  const majorVersion = semver.major(newVersion)

  // update package.json
  await fs.writeFile(
    `${__dirname}/../package.json`,
    JSON.stringify({ ...pkg, version: newVersion }, null, 2),
  )

  // build
  await execWithOutput("yarn build")

  // commit
  await execWithOutput(`git commit -a -m "v${newVersion}"`)

  // create a tag
  await execWithOutput(`git tag v${newVersion}`)

  // push to master
  await execWithOutput(`git push origin master --tags`)

  // push to major release branch
  await execWithOutput(`git push origin master:releases/v${majorVersion}`)

  console.info("Success!")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
