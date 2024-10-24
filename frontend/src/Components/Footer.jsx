const Footer = () => {
    return (
        <div>
            <footer className="bg-dark py-4">
                <div className="container text-center">
                    <p className="text-muted mb-0">© 2024 InfoLock. All rights reserved.</p>
                    <div className="d-inline-flex gap-3 mt-3">
                        <button className="btn btn-link text-muted">Privacy</button>
                        <button className="btn btn-link text-muted">Terms</button>
                        <button className="btn btn-link text-muted">Contact</button>
                    </div>
                </div>
            </footer>
        </div>
    )
}
export default Footer;