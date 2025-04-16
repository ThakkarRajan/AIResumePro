// app/contact/page.js
export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          Contact Us
        </h2>
        <div className="space-y-4 text-center text-gray-700 text-base sm:text-lg">
          <p>
            <span className="font-semibold text-purple-700">Email:</span>{" "}
            <a
              href="mailto:thakkarrajanca@gmail.com"
              className="text-blue-600 underline hover:text-blue-800"
            >
              thakkarrajanca@gmail.com
            </a>
          </p>
          <p>
            <span className="font-semibold text-purple-700">Github:</span>{" "}
            <a
              href="https://github.com/ThakkarRajan"
              className="text-blue-600 underline hover:text-blue-800"
            >
              ThakkarRajan
            </a>
          </p>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          We'd love to hear from you. Reach out anytime!
        </div>
      </div>
    </div>
  );
}
