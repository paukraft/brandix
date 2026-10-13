import type { Element, ElementContent, Root } from "hast"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remend from "remend"

/** Wraps every word in a span of its own, so only newly streamed ones fade in. */
function rehypeStreamWords() {
  const wrap = (element: Element) => {
    element.children = element.children.flatMap((child): ElementContent[] => {
      if (child.type === "element") wrap(child)
      if (child.type !== "text") return [child]
      return child.value
        .split(/(\s+)/)
        .filter(Boolean)
        .map((chunk): ElementContent =>
          /^\s+$/.test(chunk)
            ? { type: "text", value: chunk }
            : {
                type: "element",
                tagName: "span",
                properties: { className: ["t-stream-w"] },
                children: [{ type: "text", value: chunk }],
              }
        )
    })
  }

  return (tree: Root) => {
    for (const child of tree.children) {
      if (child.type === "element") wrap(child)
    }
  }
}

const heading = "mt-2 text-heading font-medium text-balance first:mt-0"

const components: Components = {
  h1: ({ node: _, ...props }) => <h3 className={heading} {...props} />,
  h2: ({ node: _, ...props }) => <h3 className={heading} {...props} />,
  h3: ({ node: _, ...props }) => <h3 className={heading} {...props} />,
  h4: ({ node: _, ...props }) => <h4 className="font-medium" {...props} />,
  p: ({ node: _, ...props }) => <p className="text-pretty" {...props} />,
  strong: ({ node: _, ...props }) => (
    <strong className="font-medium" {...props} />
  ),
  ul: ({ node: _, ...props }) => (
    <ul
      className="flex list-disc flex-col gap-1 pl-5 marker:text-muted-foreground"
      {...props}
    />
  ),
  ol: ({ node: _, ...props }) => (
    <ol
      className="flex list-decimal flex-col gap-1 pl-5 marker:text-muted-foreground"
      {...props}
    />
  ),
  li: ({ node: _, ...props }) => (
    <li className="pl-1 text-pretty [&>ol]:mt-1 [&>ul]:mt-1" {...props} />
  ),
  a: ({ node: _, ...props }) => (
    <a
      className="underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  blockquote: ({ node: _, ...props }) => (
    <blockquote
      className="flex flex-col gap-3 rounded-lg bg-tile px-4 py-3 text-muted-foreground"
      {...props}
    />
  ),
  code: ({ node: _, ...props }) => (
    <code
      className="rounded-sm bg-foreground/[0.05] px-1 py-0.5 font-mono text-[0.9em]"
      {...props}
    />
  ),
  pre: ({ node: _, ...props }) => (
    <pre
      className="scroll-quiet overflow-x-auto rounded-lg bg-tile px-4 py-3 text-note [&>code]:bg-transparent [&>code]:p-0"
      {...props}
    />
  ),
  hr: () => <hr className="h-px border-0 bg-foreground/[0.07]" />,
  table: ({ node: _, ...props }) => (
    <div className="scroll-quiet overflow-x-auto rounded-lg bg-tile">
      <table className="w-full text-left text-note" {...props} />
    </div>
  ),
  tbody: ({ node: _, ...props }) => (
    <tbody className="bg-card/60 dark:bg-transparent" {...props} />
  ),
  th: ({ node: _, ...props }) => (
    <th
      className="px-4 py-2.5 text-caption font-normal text-muted-foreground"
      {...props}
    />
  ),
  td: ({ node: _, ...props }) => (
    <td className="px-4 py-2.5 align-top" {...props} />
  ),
}

/**
 * A text reply. While `live`, markdown still being written (an unclosed
 * `**bold`, a half link) is closed, so it never shows as raw syntax.
 */
export function Markdown({ text, live }: { text: string; live: boolean }) {
  return (
    <div className="flex flex-col gap-3 text-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeStreamWords]}
        components={components}
        disallowedElements={["img"]}
      >
        {live ? remend(text) : text}
      </ReactMarkdown>
    </div>
  )
}
