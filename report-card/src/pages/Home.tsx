import { Link } from "react-router-dom"

const features = [
    {
        title: "Create Your School",
        description:
            "Set up your school profile instantly with custom identity and branding support.",
    },
    {
        title: "Classroom Structure",
        description:
            "Build classes and sections that match your school’s unique hierarchy.",
    },
    {
        title: "Schema-Based Templates",
        description:
            "Design marksheets with subjects, grading rules, and layout templates.",
    },
    {
        title: "Add Students to Class",
        description:
            "Assign students easily to the correct classes based on your schema.",
    },
    {
        title: "Print Digital Marksheet",
        description:
            "Generate print-ready marksheets automatically from your schema.",
    },
    {
        title: "100% Free Access",
        description:
            "No hidden fees. All features available from the start—free for schools.",
    },
];


function Home() {
    return (
        <div >
            <section className="px-0 sm:px-6 lg:px-8 py-24 max-w-5xl mx-auto text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Smart School<br className="sm:hidden" /> Marksheet Management
                </h1>
                <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                    Create, manage, and print verified marksheets with ease—digitally, securely, and for free.
                </p>
                <Link
                    to="/schools"
                    className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-medium shadow transition"
                >
                    🚀 Get Started Free
                </Link>
            </section>

            {/* Feature Grid */}
            <section id="features" className="px-4 sm:px-6 lg:px-8 pb-20 max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Everything You Need in One Platform</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
                        >
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact / Support */}
            <section id="contact" className="px-4 sm:px-6 lg:px-8 py-16 bg-slate-50 border-t border-slate-200 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Have a question or suggestion?</h3>
                <p className="text-slate-600 max-w-xl mx-auto mb-6">
                    I’m always open to feedback or collaboration. Reach out via email or follow my work online.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                    <a href="mailto:mrroshan738949@gmail.com" className="text-blue-600 hover:underline">📧 mrroshan738949@gmail.com</a>
                    <a href="https://github.com/Roshanyadav1" target="_blank" rel="noreferrer" className="hover:underline text-slate-600">
                        GitHub
                    </a>
                    <a href="https://www.linkedin.com/in/roshan-yadav-1bb350215/" target="_blank" rel="noreferrer" className="hover:underline text-slate-600">
                        LinkedIn
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center text-sm py-6 text-slate-500 border-t border-slate-200">
                &copy; {new Date().getFullYear()} MarksheetPro — Built for modern schools
            </footer>
        </div>
    )
}

export default Home