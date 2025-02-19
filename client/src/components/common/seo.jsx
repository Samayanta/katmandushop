import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";

const SEO = ({ 
  title, 
  description, 
  keywords,
  ogImage,
  ogUrl,
  children 
}) => {
  const siteTitle = "Katmandu Shop";
  const defaultDescription = "Discover authentic Nepali fashion and accessories at Katmandu Shop. Shop for traditional and modern clothing, jewelry, and more.";
  const defaultKeywords = "nepali fashion, traditional clothing, accessories, katmandu shop, nepal";
  const defaultOgImage = "/katmandu-shop-high-resolution-logo.png";

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title ? `${title} | ${siteTitle}` : siteTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={title ? `${title} | ${siteTitle}` : siteTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl || window.location.href} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title ? `${title} | ${siteTitle}` : siteTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />

      {children}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  ogImage: PropTypes.string,
  ogUrl: PropTypes.string,
  children: PropTypes.node,
};

export default SEO;
