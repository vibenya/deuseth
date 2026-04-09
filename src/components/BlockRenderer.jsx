export default function BlockRenderer({ content }) {
  if (!content || !content.blocks) return null

  const blocks = content.blocks
  const elements = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]

    if (block.type === 'unstyled') {
      if (block.text.trim()) {
        elements.push(<p key={block.key} className="graf graf--p">{block.text}</p>)
      }
    } else if (block.type === 'header-one') {
      elements.push(<h2 key={block.key} className="graf graf--h2">{block.text}</h2>)
    } else if (block.type === 'header-two') {
      elements.push(<h3 key={block.key} className="graf graf--h3">{block.text}</h3>)
    } else if (block.type === 'header-three') {
      elements.push(<h4 key={block.key} className="graf graf--h4">{block.text}</h4>)
    } else if (block.type === 'blockquote') {
      elements.push(<blockquote key={block.key} className="graf graf--blockquote">{block.text}</blockquote>)
    } else if (block.type === 'image' && block.data?.url) {
      elements.push(
        <figure key={block.key} className="graf graf--figure">
          <img src={block.data.url} alt="" />
        </figure>
      )
    } else if (block.type === 'unordered-list-item') {
      const items = []
      while (i < blocks.length && blocks[i].type === 'unordered-list-item') {
        items.push(<li key={blocks[i].key}>{blocks[i].text}</li>)
        i++
      }
      elements.push(<ul key={`ul-${block.key}`} className="graf graf--ul">{items}</ul>)
      continue
    } else if (block.type === 'ordered-list-item') {
      const items = []
      while (i < blocks.length && blocks[i].type === 'ordered-list-item') {
        items.push(<li key={blocks[i].key}>{blocks[i].text}</li>)
        i++
      }
      elements.push(<ol key={`ol-${block.key}`} className="graf graf--ol">{items}</ol>)
      continue
    }
    i++
  }

  return <div className="block-renderer">{elements}</div>
}
