import Link from 'next/link'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms of Service</h1>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Last updated: March 19, 2026
          </p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Acceptance of Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              By accessing or using this service, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the service.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Description of Service</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We provide AI-powered image processing tools for Amazon sellers, including background removal, watermark removal, image upscaling, and compliance checking.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">User Accounts</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must be at least 18 years old to use this service</li>
              <li>You agree to provide accurate and complete information</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Payments and Points</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Payments are processed by PayPal</li>
              <li>Points purchased do not expire unless stated in the package terms</li>
              <li>We reserve the right to modify pricing with prior notice</li>
              <li>Refunds are handled on a case-by-case basis</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">User Content</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>You retain ownership of the images you upload</li>
              <li>You are responsible for ensuring you have the right to process any images you upload</li>
              <li>We do not claim ownership of your images</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Prohibited Uses</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>You may not use this service for any illegal purposes</li>
              <li>You may not infringe on the intellectual property rights of others</li>
              <li>You may not attempt to hack, reverse engineer, or abuse the service</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Disclaimer</h2>
            <p className="text-gray-700 dark:text-gray-300">
              The service is provided "as is" without warranty of any kind, express or implied. We do not guarantee that the service will always be available, error-free, or that processing results will always be perfect.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Changes to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update these terms from time to time. We will notify users of material changes.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link href="/register" className="text-blue-600 hover:text-blue-500">
              ← Back to registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
export const runtime = 'edge'
