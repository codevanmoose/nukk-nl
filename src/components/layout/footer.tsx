import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-2">Over nukk.nl</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered fact-checking voor nu.nl artikelen. 
              Ontdek subjectiviteit en meningen gepresenteerd als feiten.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-2">Links</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/adverteren" className="text-muted-foreground hover:text-foreground">
                  Adverteren
                </Link>
              </li>
              <li>
                <a href="mailto:info@nukk.nl" className="text-muted-foreground hover:text-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-2">Juridisch</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Gebruiksvoorwaarden
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 nukk.nl. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  );
}