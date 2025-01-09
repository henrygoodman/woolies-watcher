'use client';

export default function Page() {
  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto max-w-5xl p-6 pt-12 bg-card rounded-lg shadow-md">
        <h1 className="text-4xl font-extrabold text-center mb-4 text-primary">
          Contact Me
        </h1>
        <p className="text-lg text-center mb-6 text-secondary-foreground">
          Have questions, feedback, or just want to say hello? Feel free to
          reach out!
        </p>
        <div className="flex justify-center">
          <a
            href="mailto:contact@henrygoodman.dev?subject=Website Feedback"
            className="text-accent text-lg font-medium underline hover:text-accent-foreground transition"
          >
            contact@henrygoodman.dev
          </a>
        </div>
      </div>
    </div>
  );
}
