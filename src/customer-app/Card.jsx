/** One item card, styled like the customer app's cards, with pencil (edit) and bin (delete). */
export const PencilIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
export const TrashIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>;

export default function Card({ img, emoji, title, sub, extra, badge, onEdit, onDelete }) {
  return (
    <article className="cx-card">
      <div className="cx-tools">
        <button type="button" className="cx-b" aria-label="Edit" title="Edit" onClick={onEdit}><PencilIcon /></button>
        <button type="button" className="cx-b del" aria-label="Delete" title="Delete" onClick={onDelete}><TrashIcon /></button>
      </div>
      {img ? <img src={img} alt="" loading="lazy" /> : <div className="cx-ph">{emoji || '🌿'}</div>}
      <div className="cx-info">
        <b>{title || 'Untitled'}</b>
        {sub && <span>{sub}</span>}
        {extra && <span className="cx-price">{extra}</span>}
        {badge && <em>{badge}</em>}
      </div>
    </article>
  );
}
