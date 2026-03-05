export const WeeklyCalendar = () => {
  return (
    <div className="rounded-2xl glass overflow-hidden h-full">
      <iframe
        src="https://calendar.google.com/calendar/embed?src=brunolealcavalcante%40gmail.com&ctz=America%2FSao_Paulo"
        className="w-full h-full border-0 min-h-[500px]"
        scrolling="no"
        title="Google Calendar"
      />
    </div>
  );
};
