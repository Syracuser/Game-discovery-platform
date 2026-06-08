import { Link } from "react-router-dom";
import { MdWifiOff } from "react-icons/md";
import "./NotFound.css";

function NotFound() {
  return (
    <div className="not-found">

      <div className="not-found__icon-wrapper" aria-hidden="true">
        <MdWifiOff className="not-found__icon" />
      </div>

      <p className="not-found__code">404</p>
      <h1 className="not-found__heading">Page not found</h1>

      <p className="not-found__subtext">
        The page you're looking for doesn't exist or was moved.
      </p>

      <Link to="/" className="not-found__btn not-found__btn--primary">
        Go back Home <span>→</span>
      </Link>

    </div>
  );
}

export default NotFound;
