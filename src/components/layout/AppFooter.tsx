import React from 'react';
import { Link } from 'react-router-dom';

const AppFooter: React.FC = () => {
  console.log('AppFooter loaded');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40 text-muted-foreground">
      <div className="container mx-auto py-6 px-4 md:px-6 text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-center md:text-left">
            &copy; {currentYear} BankDash Inc. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/security-center" className="hover:text-primary transition-colors">
              Security Center
            </Link>
            <Link to="/contact-us" className="hover:text-primary transition-colors">
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;