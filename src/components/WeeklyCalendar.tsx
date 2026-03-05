export const WeeklyCalendar = () => {
  return (
    <div className="rounded-2xl glass overflow-hidden">
      <iframe
        src="https://calendar.google.com/calendar/embed?src=brunolealcavalcante%40gmail.com&ctz=America%2FSao_Paulo"
        className="w-full border-0"
        height="480"
        scrolling="no"
        title="Google Calendar"
      />
    </div>
  );
};
