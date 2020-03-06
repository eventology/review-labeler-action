import * as core from "@actions/core"
// import * as github from "@actions/github"
import { promises as fs } from "fs"
import { join } from "path"
import { inspect } from "util"
import yaml from "yaml"
import * as yup from "yup"

// const client = new github.GitHub(core.getInput("token"))

// const repoParams = {
//   owner: github.context.repo.owner,
//   repo: github.context.repo.repo,
// }

const configSchema = yup.object({
  events: yup.array(
    yup.object({
      users: yup.array(yup.string()),
      prApprove: yup.object({
        addLabel: yup.array(yup.string()),
        removeLabel: yup.array(yup.string()),
      }),
      prDeny: yup.object({
        addLabel: yup.array(yup.string()),
        removeLabel: yup.array(yup.string()),
      }),
    }),
  ),
})

async function getConfigContents() {
  // TODO: load from file
  return fs.readFile(join(__dirname, "../example-config.yml"), "utf-8")
}

async function main() {
  core.info("Loading config")
  const unsafeConfig = yaml.parse(await getConfigContents())

  core.info("Validating config")
  const config = await configSchema.validate(unsafeConfig)

  core.info(inspect(config, { depth: Infinity }))
}

main().catch((error) => {
  core.error(String(error))
  process.exit(1)
})

// client.repos.getContents({
//   ...repoParams,
//   path: ".github/labeler.yml",
// })

// core.info("hello world")
