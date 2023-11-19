import Markdoc from "@markdoc/markdoc"
import React, { FC } from "react"
import { CodeBlock } from "./code-block"
import { citationConfig } from "./config"
import { Paragraph } from "./paragraph"

export const Markdown = (props) => {
  const ast = Markdoc.parse(props.content)

  const content = Markdoc.transform(ast, {
    ...citationConfig,
  })

  return Markdoc.renderers.react(content, React, {
    components: { Paragraph, CodeBlock },
  })
}
