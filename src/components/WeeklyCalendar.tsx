export const WeeklyCalendar = () => {
  return (
    <div className="rounded-2xl glass overflow-hidden" style={{ height: 'calc(100% + 15px)' }}>
      <iframe
        src="https://calendar.google.com/calendar/embed?src=brunolealcavalcante%40gmail.com&ctz=America%2FSao_Paulo"
        className="w-full h-full border-0 dark:invert dark:hue-rotate-180"
        scrolling="no"
        title="Google Calendar"
      />
    </div>
  );
};
