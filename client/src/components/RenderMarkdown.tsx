import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

const components: Components = {
  a: ({ node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  ),
};

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <div className="prose prose-sm prose max-w-none text-gray-600 text-sm leading-relaxed">
      <div className="text-sm leading-relaxed">
        <ReactMarkdown
          rehypePlugins={[rehypeSanitize]}
          components={{
            h2: ({ children }) => (
              <h2 className="text-base text-gray-600 font-semibold">{children}</h2>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-5 text-sm">{children}</ul>
            ),
            li: ({ children }) => <li className="mb-1">{children}</li>,
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
