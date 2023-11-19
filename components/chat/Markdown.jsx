import React, { memo, useEffect, useRef, useState } from "react"
import remarkGfm from "remark-gfm"
import ReactMarkdown, { Options } from "react-markdown"
import remarkImages from "remark-images"

export const MemoizedReactMarkdown = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
)

const Markdown = ({ value }) => {
  const markdownRef = useRef(null)

  return (
    <div ref={markdownRef}>
      <MemoizedReactMarkdown
        className="prose prose-slate prose-sm dark:prose-invert break-words prose-p:leading-relaxed prose-pre:p-0 max-w-none"
        remarkPlugins={[remarkGfm, remarkImages]}
        components={{
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>
          },
          code({ node, inline, className, children, ...props }) {
            if (children.length) {
              if (children[0] == "▍") {
                return (
                  <span className="mt-1 animate-pulse cursor-default">▍</span>
                )
              }

              children[0] = children[0].replace("`▍`", "▍")
            }

            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
          },
        }}
      >
        {value}
      </MemoizedReactMarkdown>
    </div>
  )
}

export default Markdown
