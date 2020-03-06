import * as core from "@actions/core"
import * as github from "@actions/github"
import { inspect } from "util"

const client = new github.GitHub(core.getInput("token"))

const repoParams = {
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
}

async function main() {
  await client.pulls.createReview({
    ...repoParams,
    pull_number: github.context.issue.number,
    event: "APPROVE",
  })

  // core.info("Loading config")
  // const unsafeConfig = await getConfig()

  // core.info("Validating config")
  // const config = await validateConfig(unsafeConfig)

  core.info(inspect(github.context, { depth: Infinity }))
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
