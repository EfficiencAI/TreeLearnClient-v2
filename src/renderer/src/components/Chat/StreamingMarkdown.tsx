import React, { useState, useEffect, useMemo, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface StreamingMarkdownProps {
  content: string
  isStreaming?: boolean
}

const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({ content, isStreaming = false }) => {
  const [displayContent, setDisplayContent] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScrollTime = useRef(0)
  const SCROLL_THROTTLE = 100 // 滚动节流时间

  useEffect(() => {
    // 移除任何延迟，直接设置内容
    setDisplayContent(content)
    console.log('StreamingMarkdown 内容更新:', content.length)
  }, [content])

  // 优化的自动滚动
  useEffect(() => {
    if (containerRef.current && isStreaming) {
      const now = Date.now()
      if (now - lastScrollTime.current > SCROLL_THROTTLE) {
        containerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        })
        lastScrollTime.current = now
      }
    }
  }, [displayContent, isStreaming])

  // 安全处理Markdown内容
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(displayContent)
  }, [displayContent])

  // 流式状态指示器
  const StreamingIndicator = (): JSX.Element | null => {
    if (!isStreaming) return null

    return (
      <span className="streaming-indicator">
        <span className="streaming-dot"></span>
        <span className="streaming-dot"></span>
        <span className="streaming-dot"></span>
      </span>
    )
  }

  return (
    <div ref={containerRef} className={`streaming-markdown ${isStreaming ? 'is-streaming' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: ({ className, children, ...props }) => {
            const isInline = !className?.includes('language-')
            const language = className?.replace('language-', '') || ''

            return isInline ? (
              <code className="inline-code" {...props}>
                {children}
              </code>
            ) : (
              <div className="code-block-wrapper">
                {language && (
                  <div className="code-block-header">
                    <span className="code-language">{language}</span>
                    <button
                      className="copy-button"
                      onClick={() => navigator.clipboard.writeText(String(children))}
                      title="复制代码"
                    >
                      📋
                    </button>
                  </div>
                )}
                <pre className="code-block">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            )
          },
          p: ({ children }) => <p className="markdown-paragraph">{children}</p>,
          h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
          h4: ({ children }) => <h4 className="markdown-h4">{children}</h4>,
          h5: ({ children }) => <h5 className="markdown-h5">{children}</h5>,
          h6: ({ children }) => <h6 className="markdown-h6">{children}</h6>,
          ul: ({ children }) => <ul className="markdown-list">{children}</ul>,
          ol: ({ children }) => <ol className="markdown-list markdown-ordered-list">{children}</ol>,
          li: ({ children }) => <li className="markdown-list-item">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="markdown-blockquote">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="table-wrapper">
              <table className="markdown-table">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="markdown-th">{children}</th>,
          td: ({ children }) => <td className="markdown-td">{children}</td>,
          a: ({ href, children }) => (
            <a href={href} className="markdown-link" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className="markdown-image" loading="lazy" />
          )
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
      <StreamingIndicator />
    </div>
  )
}

export default StreamingMarkdown
