/**
 * Privacy Policy Text
 * 
 * This component displays privacy policy information.
 * You can customize the content or link to your full privacy policy page.
 */

export function PrivacyPolicyLink() {
  return (
    <button 
      className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
      onClick={() => {
        // You can either:
        // 1. Open a modal with privacy policy content
        // 2. Navigate to a privacy policy page
        // 3. Open an external link
        console.log('Privacy Policy clicked');
      }}
    >
      Privacy Policy
    </button>
  );
}

export function PrivacyPolicyContent() {
  return (
    <div className="space-y-4 text-sm text-muted-foreground">
      <h2 className="text-lg font-bold text-foreground">Privacy Policy</h2>
      
      <section>
        <h3 className="font-semibold text-foreground mb-2">Data Collection</h3>
        <p>
          These free tools run entirely in your browser. Your answers are stored only in your browser's local storage and are never sent to any server.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-foreground mb-2">Analytics</h3>
        <p>
          We use Google Analytics 4 to understand how visitors use this site. This helps us improve the tools. Analytics data is anonymized and does not track individual users.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-foreground mb-2">Cookies</h3>
        <p>
          We use cookies to:
        </p>
        <ul className="list-disc list-inside ml-2 space-y-1">
          <li>Remember your cookie consent preference</li>
          <li>Enable analytics functionality</li>
          <li>Serve advertisements through Google AdSense</li>
        </ul>
        <p className="mt-2">
          You can control cookies through your browser settings. Rejecting analytics and ad cookies will still allow the tools to function normally.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-foreground mb-2">Advertisements</h3>
        <p>
          This site displays ads via Google AdSense. These ads are served based on general content relevance, not personal data about you (unless you have consented to personalized ads).
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-foreground mb-2">Your Rights</h3>
        <p>
          Since we don't collect personal data on our servers, there's nothing to access, modify, or delete. You control all your data by managing your browser's local storage.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-foreground mb-2">Questions?</h3>
        <p>
          If you have questions about this privacy policy, please contact us at your email or website.
        </p>
      </section>
    </div>
  );
}
