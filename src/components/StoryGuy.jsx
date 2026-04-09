export default function StoryGuy({ id, image, name, mentioned, onClick }) {
  return (
    <div onClick={() => onClick(id)} className={'story-guy ' + (mentioned ? 'story-guy--mentioned' : '')}>
      <img className="story-guy__image" src={image} alt={name} />
    </div>
  )
}
