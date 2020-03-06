import { promises as fs } from "fs"
import { join } from "path"
import yaml from "yaml"
import * as yup from "yup"

export type Config = yup.InferType<typeof configSchema>

const groupConfigSchema = yup.object({
  users: yup.array(yup.string()).required(),
  approval_labels: yup.array(yup.string()).required(),
  denial_labels: yup.array(yup.string()).required(),
  removed_labels: yup.array(yup.string()).default([]),
})

const configSchema = yup.object({
  version: yup
    .number()
    .required()
    .oneOf([1]),
  groups: yup.array(groupConfigSchema).required(),
})

export async function getConfig(): Promise<unknown> {
  // TODO: load from repo file
  const content = await fs.readFile(
    join(__dirname, "../example-config.yml"),
    "utf-8",
  )

  return yaml.parse(content)
}

export async function validateConfig(unsafeConfig: unknown): Promise<Config> {
  return configSchema.validate(unsafeConfig)
}
