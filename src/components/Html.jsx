/** Renders an HTML string produced by a tab's view function. */
export default function Html({ html }) {
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
