import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Last updated: March 19, 2026
          </p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Overview</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We provide AI image processing tools for Amazon sellers. We collect minimal information needed to operate our service.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Account information: email address</li>
              <li>Processing history: records of images you process</li>
              <li>Payment information: handled by PayPal, we don't store your credit card details</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Provide and maintain our service</li>
              <li>Track your remaining image points</li>
              <li>Keep a history of your processed images</li>
              <li>Communicate with you about service updates</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Image Storage</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your processed images are stored on Cloudflare R2 storage. We do not use your images for any AI training purposes without your explicit consent.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Third-Party Services</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Supabase - database and authentication</li>
              <li>PayPal - payment processing</li>
              <li>Cloudflare R2 - storage</li>
              <li>Remove.bg - background removal API</li>
              <li>Clipdrop - AI inpainting and upscaling API</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              Each third-party service has their own privacy policy.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Contact</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about this privacy policy, you can contact us.
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
