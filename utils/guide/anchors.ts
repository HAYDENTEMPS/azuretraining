import type { Domain, GuideAnchor } from '@/types';

/**
 * Mapping of quiz domains to guide anchors for deep linking
 * These anchors correspond to major headings in the AZ-104 Cram Guide
 */
export const GUIDE_ANCHORS: GuideAnchor[] = [
  {
    domain: "Identities",
    anchor: "identities-deep-review",
    title: "Azure Active Directory & Identity Management"
  },
  {
    domain: "Governance",
    anchor: "governance-deep-review", 
    title: "Azure Governance & Policy"
  },
  {
    domain: "Storage",
    anchor: "storage-deep-review",
    title: "Azure Storage Solutions"
  },
  {
    domain: "Compute",
    anchor: "compute-deep-review",
    title: "Azure Compute Services"
  },
  {
    domain: "Networking",
    anchor: "networking-deep-review",
    title: "Azure Networking"
  },
  {
    domain: "Monitoring",
    anchor: "monitoring-deep-review",
    title: "Azure Monitoring & Diagnostics"
  },
  {
    domain: "BackupDR",
    anchor: "backup-dr-deep-review",
    title: "Backup & Disaster Recovery"
  },
  {
    domain: "Security",
    anchor: "security-deep-review",
    title: "Azure Security"
  },
  {
    domain: "Hybrid",
    anchor: "hybrid-deep-review",
    title: "Hybrid Solutions"
  },
  {
    domain: "Cost",
    anchor: "cost-deep-review",
    title: "Cost Management & Optimization"
  }
];

/**
 * Get the anchor for a specific domain
 */
export function getDomainAnchor(domain: Domain): GuideAnchor | undefined {
  return GUIDE_ANCHORS.find(anchor => anchor.domain === domain);
}

/**
 * Get the guide URL with anchor for a specific domain
 */
export function getGuideUrl(domain: Domain): string {
  const anchor = getDomainAnchor(domain);
  if (!anchor) return '/guide';
  return `/guide#${anchor.anchor}`;
}

/**
 * Generate anchor ID from heading text
 * Converts heading text to URL-safe anchor
 */
export function generateAnchorId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim() // Remove leading/trailing spaces
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract potential headings from HTML content for anchor generation
 * Returns array of heading texts that could become anchors
 */
export function extractHeadings(htmlContent: string): string[] {
  const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
  const headings: string[] = [];
  let match;
  
  while ((match = headingRegex.exec(htmlContent)) !== null) {
    // Strip HTML tags from heading text
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    if (text) {
      headings.push(text);
    }
  }
  
  return headings;
}

/**
 * Inject anchor IDs into HTML headings for navigation
 * Modifies HTML content to add id attributes to headings
 */
export function injectAnchors(htmlContent: string): string {
  return htmlContent.replace(/<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/gi, (match, level, attributes, text) => {
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    const anchorId = generateAnchorId(plainText);
    
    // Check if id attribute already exists
    if (attributes.includes('id=')) {
      return match; // Don't modify if id already exists
    }
    
    return `<h${level}${attributes} id="${anchorId}">${text}</h${level}>`;
  });
}
