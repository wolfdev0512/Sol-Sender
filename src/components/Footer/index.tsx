import React from "react";

export default function Footer() {
    return (
        <footer className="footer text-primary">
            <p className="text-center">
                Developed By
                <a
                    href="http://www.bhagyamudgal.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                >
                    Bhagya Mudgal
                </a>
            </p>
            <p className="mx-2">|</p>
            <span className="flex items-center">
                <p className="mr-2">Powered By</p>
                <a
                    href="http://solana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        src="/solana-crypto.png"
                        alt="solana.com"
                        className="w-6 hover:scale-125 transition-all duration-200 ease-in-out"
                    />
                </a>
            </span>
        </footer>
    );
}
