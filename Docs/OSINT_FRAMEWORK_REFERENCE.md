# OSINT Framework — Full Tool Directory

Scraped from https://osintframework.com/ (data source: [lockfale/osint-framework](https://github.com/lockfale/osint-framework) `public/arf.json`, the JSON tree that actually backs the site's interactive UI — the rendered HTML page itself is a client-side tree view with no content in its static markup).

Flags: **(T)** local tool/install required · **(D)** Google Dork · **(R)** registration required · **(M)** manual URL editing needed · *(deprecated)* flagged dead/retired by the maintainers.


# Username

## Username Search Engines
- [WhatsMyName Web](https://whatsmyname.app/)
  Free web-based OSINT username enumeration tool that searches for a specified username across 1500+ websites and platforms simultaneously, returning direct links to matching profiles.
  _best for: Quick web-based username enumeration across social media, forums, gaming platforms, and professional networks_
- [WhatsMyName (T)](https://github.com/WebBreacher/WhatsMyName)
  OSINT project maintaining a curated JSON database of website detection patterns for username enumeration. Web interface available at whatsmyname.app.
  _best for: Username enumeration using community-maintained site detection data_
- [Sylva Identity Discovery (T)](https://sylva.pfeister.dev/) (T)
  Open-source CLI tool for username and identity discovery with branch discovery to expand searches as additional linked identities are uncovered.
  _best for: Username enumeration with identity branching_
- [Sherlock (T)](https://github.com/sherlock-project/sherlock) (T)
  Python CLI tool that hunts down social media accounts by username across 400+ social networks. Supports Tor routing, proxy configuration, and CSV/XLSX export.
  _best for: Mass username enumeration across 400+ sites_
- [Namechk](https://namechk.com/)
  Web-based username and domain availability checker that searches 100+ social media platforms and 36 domain extensions simultaneously.
  _best for: Quick username availability check across social media and domains_
- [Thats Them](https://thatsthem.com/)
  Free people search engine aggregating data from 50+ sources. Supports lookups by name, address, phone number, or email.
  _pricing: freemium; best for: People search by name, email, phone, or address_
- [NameCheckup](https://namecheckup.com/)
  Free web-based username and domain availability checker that searches across 20+ social media platforms and 40+ domain extensions with WHOIS lookup support.
  _best for: Username and domain availability checking with WHOIS info_
- [FootprintIQ](https://footprintiq.app)
  Ethical digital footprint scanner that searches usernames, emails, and phone numbers across 500+ platforms. Includes breach detection, data broker scanning, and confidence scoring to reduce false positives.
  _pricing: freemium; best for: Username and email footprint scanning with breach and data broker exposure checks_
- [GitFive (T)](https://github.com/mxrch/GitFive) (T, R)
  OSINT CLI tool for investigating GitHub profiles. Tracks username/name history, maps emails to accounts, extracts SSH public keys, and exports findings as JSON.
  _best for: Deep investigation of GitHub user profiles and email-to-account mapping_
- [Sherlock](https://github.com/sherlock-project/sherlock) (T)
  Python CLI tool that hunts down social media accounts by username across 400+ social networks. Supports Tor routing, proxy configuration, and CSV/XLSX export.
  _best for: Mass username enumeration across 400+ sites_
- [Names Directory](https://namesdir.com/)
  Searchable database of 1B+ name combinations collected from public sources. Allows bidirectional lookup to find first names by surname or surnames by first name.
  _best for: Finding name combinations and frequency data for a given first or last name_
- [Lullar](https://com.lullar.com)
  Free people search and username lookup tool that searches across 148+ social media platforms including Instagram, TikTok, Facebook, and LinkedIn.
  _best for: Social media profile discovery by username, email, or name_

## Specific Sites
- [Amazon Usernames (M)](https://www.google.com/search?q=site:amazon.com+%3Cusername%3E) (D, M)
  Google dork that searches Amazon.com for pages associated with a specific username, surfacing public profiles, wishlists, and reviews.
  _best for: Finding Amazon public profiles, wishlists, and review activity by username_
- [Github User (M)](https://api.github.com/users/%3Cusername%3E/events/public) (M)
  Queries the GitHub public Events API to retrieve a user's recent public activity, including pushes, pull requests, issues, and other repository events.
  _best for: Enumerating a GitHub user's recent public activity and repository interactions_
- [Tinder Usernames (M)](https://www.gotinder.com/@%3Cusername%3E) (M)
  Accesses a Tinder user's public web profile via their username. The gotinder.com domain redirects to tinder.com.
  _best for: Confirming existence of a Tinder profile and viewing public profile details_
- [Keybase](https://keybase.io/)
  Platform for cryptographic identity verification, linking social media accounts, PGP keys, and cryptocurrency addresses to a single profile. Acquired by Zoom in 2020 but still operational.
  _best for: Looking up verified social accounts, PGP keys, and crypto wallets tied to a username_
- [MIT PGP Key Server](https://pgp.mit.edu/)
  MIT PGP Public Key Server for searching, submitting, and removing PGP public keys. Look up keys by name, email, or key ID to find associated cryptographic identities.
  _best for: Looking up PGP public keys associated with a username or email address_
- [ProtonMail users (M)](https://api.protonmail.ch/pks/lookup?op=index&search=<username>@protonmail.com) (M)
  Queries ProtonMail's HKP-compatible PGP key server to look up the public key for a ProtonMail username. A successful response confirms the account exists.
  _best for: Confirming whether a ProtonMail username exists and retrieving its PGP public key_
- [ProtonMail Domains (M)](https://api.protonmail.ch/pks/lookup?op=index&search=<email_address>) (M)
  Queries ProtonMail's HKP key server with a full email address to check for a PGP public key. Useful for identifying ProtonMail users on custom domains.
  _best for: Checking if an email address on a custom domain is hosted on ProtonMail_

# Email Address

## Email Search
- [Sylva Identity Discovery (T)](https://sylva.pfeister.dev/) (T)
  Identity discovery utility that searches GitHub and PGP key servers to link identities across platforms using email addresses, usernames, or PGP keys.
  _best for: Identity correlation via GitHub and PGP_
- [ThatsThem](https://thatsthem.com/reverse-email-lookup)
  Reverse email lookup tool that searches a database of hundreds of millions of emails to reveal name, address, phone number, and public records associated with an email address.
  _pricing: freemium; best for: Reverse email lookup, person identification_
- [Hunter](https://hunter.io/)
  Email finder and verifier that discovers business email addresses from company domains, names, and social profiles with up to 98% accuracy rate.
  _pricing: freemium; best for: Business email discovery, email verification_
- [Email to Address (R)](https://www.melissa.com/) (R)
  Melissa.com's data quality and verification service that validates and enriches email addresses with supplementary contact information.
  _pricing: paid; best for: Email validation, address enrichment_
- [VoilaNorbert](https://www.voilanorbert.com/)
  Email finder and verifier with 98% success rate that discovers business emails by company/domain, person name, or LinkedIn profile with bulk upload capability.
  _pricing: freemium; best for: Business email discovery, bulk email finding_
- [GHunt (T)](https://github.com/mxrch/GHunt) (T)
  Offensive Google framework that investigates Google accounts using email addresses to uncover YouTube channels, Google Photos, Maps reviews, and associated artifacts.
  _best for: Google account investigation, YouTube/Google Photos OSINT_
- [OSINT Industries](https://www.osint.industries/)
  Account linking service that extracts all registered accounts tied to an email or phone across 500+ platforms including social media, messaging apps, and lifestyle services.
  _pricing: freemium; best for: Account enumeration, breach detection, digital footprint mapping_
- [theHarvester (T)](https://github.com/laramies/theHarvester) (T)
  Command-line tool for gathering emails, subdomains, IPs, and URLs from public sources.
  _best for: Email harvesting, subdomain enumeration, passive recon_
- [Infoga (T)](https://github.com/m4ll0k/infoga) (T, D)
  Python-based email OSINT tool that gathers email account information (IP, hostname, country) from search engines, PGP servers, and Shodan, with breach checking via haveibeenpwned.
  _best for: Early-stage email reconnaissance, information gathering_
- [Skymem](https://www.skymem.info/)
  Email finder that discovers company and personal email addresses by domain or name, with bulk search, email list creation, and advanced filtering capabilities.
  _pricing: freemium; best for: Email discovery by domain, bulk email list creation_
- [Epieos Email Tool](https://tools.epieos.com/email.php)
  Freemium OSINT tool performing email reverse lookups to uncover associated social media profiles across 120+ websites and services with breach detection.
  _pricing: freemium; best for: Email reverse lookup, social media profile discovery_
- [breach.vip](https://breach.vip/)
  Free database search engine providing access to 1000+ breach databases for research, email searching, and analysis of compromised credentials.
  _best for: Breach database search, credential lookup_
- [Holehe (T)](https://github.com/megadose/holehe) (T)
  Python-based email enumeration tool that checks if an email is registered across 120+ websites and services using password-reset mechanisms.
  _best for: Email account enumeration, service detection_

## Common Email Formats
- [Email Format](https://www.email-format.com/) (M)
  Tool for analyzing and discovering corporate email address patterns and formats to predict valid employee email addresses within an organization.
  _best for: Corporate email pattern analysis, email format discovery_
- [Email Permutator](https://metricsparrow.com/toolkit/email-permutator/)
  OSINT tool that generates all possible email address combinations from a person's name and domain(s) for reconnaissance and email guessing.
  _best for: Email pattern generation, targeted email guessing_

## Email Verification
- [Reacher Github (T)](https://github.com/reacherhq/check-if-email-exists) (T)
  Open-source Rust-based email verification API that checks email deliverability without sending messages, detecting catch-all and disposable addresses.
  _best for: Email verification, bounce detection, list cleaning_
- [Reacher Demo](https://reacher.email)
  Hosted demo of the Reacher email verification API allowing free testing of email validation and deliverability checks online.
  _best for: Email verification testing, demonstration_
- [MailScrap](https://mailscrap.com/)
  Email verification tool that connects to mail servers to verify mailbox existence and removes disposable email addresses from lists.
  _pricing: freemium; best for: Email validation, list cleaning, disposable email detection_
- [Read Notify](https://www.readnotify.com/)
  Email tracking and read receipt service that monitors email opens and engagement, useful for confirming email validity through delivery.
  _pricing: freemium; best for: Email delivery confirmation, read receipt tracking_
- [Email Reputation](https://emailrep.io/)
  Tool that checks email reputation, risk scoring, and breach history to identify phishing emails, compromised accounts, and risky addresses.
  _best for: Email reputation checking, risk assessment_
- [MailboxValidator](https://www.mailboxvalidator.com/demo) (R)
  Email verification API that validates email deliverability, detects catch-all addresses, and provides risk scoring for bulk email list cleaning.
  _pricing: paid; best for: Email validation, list cleaning, bounce prevention_
- [VerifyEmail (R$)](https://emailable.com/)
- [Disposable Email Domains (T)](https://github.com/disposable-email-domains/disposable-email-domains) (T)
  Community-maintained blocklist of 5,000+ disposable email domains with allowlist support and multi-language implementation examples. Used by PyPI and other projects.
  _best for: Detecting disposable and temporary email addresses during verification_
- [Disposable Emails Registry](https://disposable-emails.github.io/)
  Searchable registry of disposable email domains with bulk download support for threat intelligence integration.
  _best for: Bulk blocking and threat intelligence integration for disposable email detection_
- [Burner Email Providers (T)](https://github.com/wesbos/burner-email-providers) (T)
  Curated list of temporary email service domains with API references and detection library implementations across multiple languages.
  _best for: Identifying burner email providers for integration into custom investigation tools_

## Breach Data
- [Have I been pwned?](https://haveibeenpwned.com/) (R)
  Database of breached credentials and email addresses from known data breaches.
  _pricing: freemium; best for: Breach detection, credential exposure checks_
- [Hudson Rock](https://www.hudsonrock.com/threat-intelligence-cybercrime-tools)
  Infostealer threat intelligence platform that searches a database of compromised devices and stolen credentials to identify if emails have been exposed via malware infections.
  _pricing: freemium; best for: Infostealer detection, breach assessment, device compromise verification_
- [DeHashed (R)](https://dehashed.com/) (R)
  Modern breach search engine indexing historical breach data over a decade old, enabling searches by email, username, password, domain, phone, and IP address.
  _pricing: freemium; best for: Breach searching, credential lookup, historical breach analysis_
- [Vigilante.pw](https://www.vigilante.pw/)
  Breach database directory and search platform raising awareness of data breaches by aggregating publicly leaked database information and breach details.
  _best for: Breach research, public breach database navigation_

## Mail Blacklists
- [MxToolbox](https://mxtoolbox.com/)
  Email deliverability diagnostics tool that checks MX records, SPF, DKIM, DMARC configuration, and server health to prevent email delivery issues.
  _best for: Email server diagnostics, deliverability testing, DNS validation_

# Domain Name

## Whois Records
- [Domain Dossier](https://centralops.net/co/DomainDossier.aspx)
  Free web-based tool that aggregates WHOIS, DNS, and network information for domains and IP addresses into a single consolidated report.
  _best for: Quick domain and IP reconnaissance with DNS and WHOIS data_
- [domainIQ](https://www.domainiq.com/) (R)
  Comprehensive domain intelligence platform offering reverse lookups, ownership history, and related domain discovery. Trusted by government agencies, domain investors, and legal firms.
  _pricing: freemium; best for: Domain ownership history, reverse analytics lookup, competitor domain research_
- [DomainTools Whois](https://whois.domaintools.com/) (R)
  Enterprise-grade WHOIS API with decades of historical domain data and rapid query response. The industry leader for threat intelligence and domain tracking.
  _pricing: paid; best for: Historical WHOIS research, threat actor tracking, enterprise domain intelligence_
- [SWITCH Internet Domains Whois (.ch)](https://www.nic.ch/whois/)
  Official Swiss domain registry WHOIS lookup service operated by SWITCH for .ch and .li country-code domains. Public registry with all owner contact details visible.
  _best for: .ch and .li domain ownership research, Swiss Internet infrastructure lookup_
- [Whoisology](https://whoisology.com/#advanced)
  Searchable archive of billions of current and historical domain WHOIS records with cross-referencing capabilities. Designed for InfoSec, legal, and research professionals.
  _pricing: freemium; best for: Historical domain ownership, reverse WHOIS lookups, domain connection tracking_
- [Whois ARIN](https://whois.arin.net/ui/advanced.jsp)
  Official American Registry for Internet Numbers WHOIS and RDAP lookup service for IPv4, IPv6, ASNs, and organizations in the North American region.
  _best for: IP address and ASN registration data, North American internet resource tracking_
- [DNSstuff](https://www.dnsstuff.com/freetools)
  Suite of free DNS and network tools providing lookups, DNS checks, and WHOIS information for domain reconnaissance.
  _best for: Quick DNS and WHOIS lookups, network diagnostics_
- [Robtex (R)](https://robtex.com/)
  Comprehensive free DNS lookup and network intelligence tool with decade-spanning database containing billions of documents of internet data. Useful for forensics and threat actor tracking.
  _best for: DNS reconnaissance, IP and domain relationship mapping, historical internet data lookup_
- [Domaincrawler.com](https://domaincrawler.com/) (R)
  Enterprise-grade domain database covering 1.4+ billion registered and unregistered domains with 80+ billion historical records since 2008. Used by brand protection and OSINT professionals.
  _pricing: paid; best for: Large-scale domain research, brand protection monitoring, zone file analysis, market intelligence_
- [MarkMonitor Whois Search](https://domains.markmonitor.com/whois/) (R)
  ICANN-accredited registrar and brand protection company offering WHOIS lookup and domain management services. Exclusively serves corporate clients including major global brands.
  _pricing: paid; best for: Corporate domain portfolio management, brand protection, trademark monitoring_
- [easyWhois](https://www.easywhois.com/)
  Free domain WHOIS lookup and DNS tools service. Now operated under the DomainHelp platform, providing domain registration information and DNS lookups.
  _best for: Quick domain WHOIS lookups and DNS checks_
- [Website Informer](https://website.informer.com/)
  Free domain and website information aggregator providing visitor statistics, safety status, Alexa rankings, ownership data, and technical details about websites.
  _best for: Website profiling, ownership verification, traffic estimation, technical stack discovery_
- [Who.is](https://who.is/)
  Comprehensive WHOIS and RDAP lookup service with large database of domain registration, DNS records, and IP information. Provides both current and historical data.
  _best for: Domain registration research, WHOIS lookups, RDAP queries, IP tracking_
- [Whois AMPed](https://whoisamped.com/)
  Mobile-optimized WHOIS lookup service accessible via web interface for domain registration information and WHOIS queries.
  _best for: Mobile-friendly WHOIS lookups, quick domain information retrieval_
- [ViewDNS.info](https://viewdns.info/)
  Comprehensive DNS lookup and WHOIS service providing detailed DNS records, reverse IP lookups, reverse WHOIS searches, and API access for automated queries.
  _best for: DNS reconnaissance, reverse IP and reverse WHOIS lookups, historical DNS tracking_
- [Daily DNS Changes](https://dailychanges.domaintools.com/)
  DomainTools service monitoring DNS record changes across domains, detecting newly registered subdomains and tracking DNS infrastructure modifications.
  _pricing: freemium; best for: DNS change detection, subdomain discovery, infrastructure monitoring_
- [IP2WHOIS](https://www.ip2whois.com)
  Free WHOIS lookup service for domain names and IP addresses, providing registration details, registrant information, location data, and API access.
  _best for: Domain and IP WHOIS lookups, registrant research_
- [Netlas.io](https://app.netlas.io/whois_domains/)
  Comprehensive internet-wide scanning and OSINT platform providing DNS, WHOIS, SSL, and network reconnaissance with attack surface discovery capabilities.
  _pricing: freemium; best for: Internet reconnaissance, DNS and WHOIS lookups, attack surface discovery, vulnerability research_

## Subdomains
- [SynapsInt](https://synapsint.com)
  Unified web-based OSINT research platform supporting domain, IP, SSL, analytics, email, phone, and social media lookups with subdomain enumeration.
  _best for: Unified OSINT research, subdomain discovery, multi-vector intelligence gathering_
- [Aquatone (T)](https://github.com/michenriksen/aquatone) (T)
  Go-based tool for domain reconnaissance that automates subdomain discovery, HTTP service scanning, screenshot capture, and visual HTML report generation for attack surface analysis.
  _best for: Visual subdomain reconnaissance, HTTP service discovery, attack surface mapping_
- [FindSubDomains](https://findsubdomains.com/)
  Free web-based automated subdomain discovery tool with filtering and analysis capabilities, showing organization names, relationships, and top subdomain statistics.
  _best for: Automated subdomain enumeration, organization name filtering, subdomain statistics_
- [Google Subdomains (D)](https://www.google.com/?gws_rd=ssl#q=site:%3Cdomain.com%3E) (D, M)
  Google Dork technique using the 'site:' operator to enumerate subdomains of a target domain via Google's search index.
  _best for: Indexed subdomain discovery, publicly visible subdomain enumeration_
- [Recon-ng (T)](https://github.com/lanmaster53/recon-ng) (T)
  Full-featured web reconnaissance framework with independent modules for data gathering.
  _best for: Modular web recon, API-driven data collection_
- [XRay](https://github.com/evilsocket/xray) (T)
  Go-based network reconnaissance tool that automates subdomain enumeration via DNS brute force, integrates Shodan for port discovery, and gathers banner information with web UI visualization.
  _best for: Automated subdomain discovery with banner grabbing, open port enumeration, Shodan integration_
- [DNS Recon (T)](https://github.com/darkoperator/dnsrecon) (T)
  Python-based DNS enumeration script supporting zone transfers, standard record enumeration, TLD expansion, DNS brute force, and PTR lookups.
  _best for: DNS enumeration, zone transfer testing, subdomain brute forcing, DNS security assessment_
- [Gobuster (T)](https://github.com/OJ/gobuster) (T)
  Multi-mode brute-force tool for DNS subdomain, virtual host, and directory discovery.
  _best for: Fast DNS and vhost brute-force enumeration_
- [Fierce Domain Scanner (T)](https://github.com/davidpepper/fierce-domain-scanner) (T)
  DNS reconnaissance tool focused on subdomain discovery and non-contiguous IP space mapping.
  _best for: DNS recon and subdomain-to-IP mapping_
- [Bluto (T)](https://github.com/darryllane/Bluto) (T)
  Recon utility for domain intelligence including DNS records, email patterns, and infrastructure clues.
  _best for: Initial domain footprinting and asset discovery_
- [OWASP Maryam (T)](https://github.com/saeeddhqan/Maryam) (T)
  Modular OWASP OSINT framework with footprinting and search modules for multi-source reconnaissance.
  _best for: Scriptable multi-module OSINT reconnaissance workflows_
- [theHarvester (T)](https://github.com/laramies/theHarvester) (T)
  Command-line tool for harvesting emails, subdomains, hosts, and URLs from public data sources.
  _best for: Passive email and subdomain collection from indexed sources_
- [Pentest-tools.com Subdomains](https://pentest-tools.com/information-gathering/find-subdomains-of-domain) (R)
  Web-based subdomain finder that enumerates subdomains for a given domain through hosted scanning.
  _pricing: freemium; best for: Quick browser-based subdomain discovery without local setup_
- [SecLists DNS Subdomains (T)](https://github.com/danielmiessler/SecLists/tree/master/Discovery/DNS) (T)
  Community-maintained DNS wordlist collection used to power subdomain brute-force workflows.
  _best for: Supplying high-quality DNS wordlists for enumeration tools_
- [dnspop (T)](https://github.com/bitquark/dnspop) (T)
  DNS reconnaissance utility for enumerating records and identifying domain-related infrastructure.
  _best for: Command-line DNS recon and record analysis_
- [gdns (T)](https://github.com/hrbrmstr/gdns) (T)
  Google DNS-focused command-line tool for DNS lookup and domain record exploration.
  _best for: Quick DNS enumeration via Google DNS services_
- [Sublist3r](https://github.com/aboul3la/Sublist3r) (T)
  Python tool for subdomain enumeration using search engines, passive sources, and optional brute-force.
  _best for: Combining passive and active subdomain discovery in one tool_
- [AltDNS (T)](https://github.com/infosec-au/altdns) (T)
  Permutation-based DNS tool that generates and resolves alternative subdomains from known names.
  _best for: Discovering likely subdomain variants through permutations_
- [Netlas.io](https://app.netlas.io/domains/)
  Comprehensive internet-wide scanning and OSINT platform providing DNS, WHOIS, SSL, and network reconnaissance with attack surface discovery capabilities.
  _pricing: freemium; best for: Internet reconnaissance, DNS and WHOIS lookups, attack surface discovery, vulnerability research_

## Discovery
- [Shodan](https://www.shodan.io/) (R)
  Search engine for internet-exposed devices, services, and security-relevant banners.
  _pricing: freemium; best for: Finding exposed services and infrastructure risk indicators_
- [Netlas.io](https://app.netlas.io/)
  Comprehensive internet-wide scanning and OSINT platform providing DNS, WHOIS, SSL, and network reconnaissance with attack surface discovery capabilities.
  _pricing: freemium; best for: Internet reconnaissance, DNS and WHOIS lookups, attack surface discovery, vulnerability research_
- [Kraken (T)](https://github.com/Sw4mpf0x/Kraken) (T)
  Open-source reconnaissance utility for domain and network intelligence gathering workflows.
  _best for: CLI-driven reconnaissance against domain and host assets_
- [Online Nikto scanner](https://nikto.online/)
  Hosted version of the Nikto web server scanner for identifying vulnerabilities, misconfigurations, and exposed files.
  _best for: Web server vulnerability scanning_
- [urlscan.io](https://urlscan.io/search/#*) (R, M)
  URL and domain analysis service that captures page loads, requests, and security-relevant artifacts.
  _pricing: freemium; best for: Investigating suspicious URLs with scan snapshots and indicators_
- [Daily DNS Changes](https://dailychanges.domaintools.com/)
  DomainTools service monitoring DNS record changes across domains, detecting newly registered subdomains and tracking DNS infrastructure modifications.
  _pricing: freemium; best for: DNS change detection, subdomain discovery, infrastructure monitoring_
- [Redirect Detective](https://redirectdetective.com/) (M)
  Web tool that traces URL redirect chains and final destinations across multi-hop redirects.
  _best for: Understanding redirect paths and affiliate or cloaking behavior_
- [Sitediff (T)](https://github.com/digininja/sitediff) (T, M)
  Command-line utility for comparing website versions to detect content and structural changes.
  _best for: Tracking site changes between snapshots for monitoring and QA_
- [BuiltWith](https://builtwith.com/)
  Technology profiling platform that identifies web stacks, frameworks, analytics, and hosting signals.
  _pricing: freemium; best for: Website technology stack fingerprinting and ecosystem mapping_
- [Wappalyzer](https://www.wappalyzer.com/) (R)
  Technology detection platform and browser tooling for identifying frameworks, CMS, and SaaS usage.
  _pricing: freemium; best for: Detecting web technologies and software dependencies at scale_
- [AnalyzeID](https://analyzeid.com/) (M)
  Reverse lookup service for tracking IDs such as Google Analytics, AdSense, and affiliate identifiers.
  _best for: Pivoting from shared tracking IDs to related domains_
- [Criminal IP Search](https://www.criminalip.io/) (R)
  Cyber threat intelligence search engine for exposed assets, domains, vulnerabilities, and risk indicators.
  _pricing: freemium; best for: Threat-focused lookup of internet-facing assets and exposures_
- [urlDNA](https://urldna.io) (R, M)
  URL intelligence service for investigating domains, redirects, and related reputation indicators.
  _pricing: freemium; best for: Quick URL/domain triage and intelligence pivoting_
- [ZoomEye.ai](https://www.zoomeye.org/) (D, R)
  Cyberspace search engine indexing internet-connected devices, services, and vulnerabilities globally. Provides AI-powered search via ZoomEyeGPT with support for ZoomEye dorks for targeted reconnaissance.
  _pricing: freemium; best for: Internet device discovery, service enumeration, vulnerability mapping, attack surface assessment_

## Certificate Search
- [Shodan](https://www.shodan.io/)
- [Google's Certificate Transparency](https://www.certificate-transparency.org/known-logs)
  Directory of all known Certificate Transparency logs monitored by Chrome and other browsers. Browse CT log records to discover issued certificates, identify unauthorized domain certificates, and monitor for certificate misuse.
  _best for: Certificate discovery, unauthorized cert detection, domain monitoring_
- [Spyse](https://spyse.com/search/certificate) (R)
  Internet assets registry providing certificate search, domain intelligence, and vulnerability discovery. Scans domains, subdomains, certificates, emails, and open ports across the global internet.
  _pricing: freemium; best for: Domain intelligence, certificate discovery, subdomain enumeration, vulnerability identification_
- [Censys](https://censys.io/) (R)
  Internet-wide scanner and search engine for hosts, certificates, and services.
  _pricing: freemium; best for: Certificate discovery, host enumeration, exposure monitoring_
- [crt.sh - Certificate Search](https://crt.sh/?) (M)
  CT log viewer aggregating certificate data from multiple Certificate Transparency logs. Search for all certificates ever issued to a domain to discover subdomains and detect certificate misuse.
  _best for: Certificate search, subdomain discovery via CT logs, detecting unauthorized certificates_
- [CertKit - Certificate Transparency Log Search](https://www.certkit.io/tools/ct-logs/)
  Fast Certificate Transparency log search tool using Clickhouse for sub-second queries. Discover all certificates issued to a domain, including Subject Alternative Names, to reveal hidden infrastructure.
  _best for: CT certificate search, subdomain enumeration, certificate misuse detection_
- [certgraph (T)](https://github.com/lanrat/certgraph) (T)
  CLI tool that crawls SSL certificates via Certificate Transparency logs to create a directed graph of domain relationships. Supports multiple drivers including crt.sh, Censys, HTTPS, and SMTP.
  _best for: Certificate mapping, domain relationship discovery, hostname enumeration via SSL certificates_
- [Netlas.io](https://app.netlas.io/certs/)
  Comprehensive internet-wide scanning and OSINT platform providing DNS, WHOIS, SSL, and network reconnaissance with attack surface discovery capabilities.
  _pricing: freemium; best for: Internet reconnaissance, DNS and WHOIS lookups, attack surface discovery, vulnerability research_

## PassiveDNS
- [Mnemonic](https://passivedns.mnemonic.no/)
  Mnemonic's public PassiveDNS service providing historical and current DNS records collected from global sensor networks. Unauthenticated queries available with rate limiting.
  _best for: Passive DNS lookups, historical domain resolutions, DNS reconnaissance_
- [DNS Dumpster](https://dnsdumpster.com/)
  Free domain research tool that discovers hosts and subdomains related to a domain. Provides DNS record enumeration (MX, TXT, Host) with a visual map of discovered infrastructure.
  _best for: Subdomain enumeration, DNS reconnaissance, infrastructure mapping_
- [Deteque (R)](https://www.deteque.com/)
  Real-time IP, domain, and threat intelligence from Spamhaus and abuse.ch alliance. Provides comprehensive malware, botnet, and abuse data with diverse IOC coverage (IPs, domains, URLs, files, cryptos).
  _pricing: freemium; best for: Domain/IP threat intelligence, malware tracking, botnet detection, abuse data_

## Reputation
- [UrlQuery.net](https://urlquery.net/)
  Free online URL scanner that analyzes webpages for malware, suspicious elements, and phishing threats. Provides comprehensive threat detection reports with threat briefs on emerging campaigns.
  _best for: URL reputation scanning, malware detection, phishing detection, threat analysis_
- [URL Void](https://www.urlvoid.com/)
  Free website reputation checker that scans URLs against 30+ blocklist engines and reputation services. Detects fraudulent and malicious websites with browser extension available.
  _best for: Website reputation checking, malware/phishing detection, threat analysis_
- [FortiGuard Reputation Service](https://fortiguard.com/iprep) (M)
  Fortinet's IP reputation service aggregating malicious source IP data from global threat sensors and collaborators. Blocks botnets, DDoS sources, and IPs associated with phishing, scanning, and malware.
  _best for: IP reputation lookup, botnet/malware source identification, threat intelligence_
- [Trend Micro Site Safety Center](https://global.sitesafety.trendmicro.com/)
  Free service that checks website safety ratings from Trend Micro's research and reputation sources. Identifies websites with malware, phishing activity, or suspicious behavior.
  _best for: Website safety verification, malware/phishing detection, threat assessment_
- [WatchGuard ReputationAuthority](https://www.reputationauthority.org/)
  In-the-cloud reputation monitoring service analyzing URL and IP threat risk. Assigns reputation scores between 1-100 using data from global sources and deployed systems.
  _best for: URL/IP reputation scoring, threat risk assessment, malicious source identification_
- [Sucuri SiteCheck](https://sitecheck.sucuri.net/)
  Free remote website scanner that checks for malware, security threats, blacklisting, and vulnerabilities. Detects outdated CMS versions, insecure configurations, and security anomalies.
  _best for: Website malware scanning, vulnerability detection, security assessment_
- [ThreatMiner.org](https://www.threatminer.org/)
  Non-profit threat intelligence portal providing IOC research including domains, IPs, malware samples, SSL certificates, WHOIS data, and malicious URLs under Creative Commons license.
  _best for: Threat intelligence research, IOC investigation, malware/phishing link analysis_
- [BlueCoat WebPulse](https://sitereview.bluecoat.com/sitereview.jsp) (M)
  Web reputation filtering service rating URLs with 50+ language support. Processes 180+ million rating requests daily with Dynamic Link Analysis for attack injection detection.
  _best for: URL categorization, website reputation filtering, malicious link detection_
- [Zscaler Zulu URL Risk Analyzer](https://zulu.zscaler.com/)
  Free dynamic risk scoring engine for web content analysis. Assesses URLs from multiple perspectives: content analysis, URL patterns, and host reputation using machine learning.
  _best for: URL risk scoring, web threat detection, malicious content analysis_
- [Joe Sandbox Url Analyzer](https://www.url-analyzer.net/) (R)
  Deep URL and document analysis using real browser execution in isolated environments. Detects malware, phishing, and suspicious behavior with detailed system/network monitoring.
  _pricing: freemium; best for: Malware/phishing analysis, URL behavior detection, deep web threat investigation_
- [Deepviz Domain Search](https://search.deepviz.com/) (R)
  Threat intelligence platform providing domain, IP, and malware sample search with daily threat feeds. Includes similar sample finding, malware family clustering, and API/Splunk integration.
  _pricing: freemium; best for: Domain/IP threat intelligence, malware analysis, threat feed subscription_
- [AVG Threat Labs](https://www.avg.com/en/signal/website-safety) *(deprecated)*
  Website security analysis tool providing instant safety assessment of sites. Merges quantitative threat detection from 100M AVG users with LinkScanner technology in graphical reports.
  _best for: Website safety assessment, threat detection reports, website popularity tracking_
- [Webroot BrightCloud URL/IP Lookup](https://www.brightcloud.com/tools/url-ip-lookup.php)
  Web classification and reputation tool providing URL/IP threat and content analysis. Uses machine learning reputation scoring across 82 content categories with IP risk tiering.
  _best for: URL/IP reputation lookup, web classification, threat intelligence, web categorization_
- [vURL Online](https://vurldissect.co.uk/)
  URL and domain dissection tool providing detailed reputation analysis and security assessment.
  _best for: URL/domain dissection and reputation_
- [AlienVault Open Threat Exchange](https://otx.alienvault.com/browse/pulses/) (R)
  Community-driven threat intelligence platform enabling collaborative defense with 180K+ participants sharing 19M+ threats daily.
  _best for: Community threat intelligence sharing_
- [Malware Domain List](https://www.malwaredomainlist.com/mdl.php)
  Interactive malware domain reputation lookup providing verified malicious domain intelligence.
  _best for: Malware domain reputation queries_
- [Web Inspector Online Scan](https://www.webinspector.com/website-malware-scanner/)
  Free cloud-based website malware scanner with daily automated scanning and blacklist checking capabilities.
  _best for: Website malware scanning_
- [Google Safe Browsing API](https://developers.google.com/safe-browsing/?csw=1) (R)
  Google's free API detecting malicious URLs and phishing sites with protection across billions of devices.
  _best for: Malware and phishing URL detection_
- [Cisco Talos](https://talosintelligence.com/)
  Cisco's comprehensive IP and domain reputation intelligence system with real-time threat detection spanning millions of sensors.
  _best for: IP/domain reputation intelligence_

## Domain Blacklists
- [Threatexpert.com Malicious URLs](https://www.networksec.org/grabbho/block.txt) *(deprecated)*
  Malicious URL blacklist feed from abuse.ch's URL repository tracking malware distribution vectors.
  _best for: Malware URL intelligence_
- [Zeus C2 Tracker](https://zeustracker.abuse.ch/blocklist.php?download=domainblocklist)
  abuse.ch project tracking Zeus command and control servers with domain and IP blocklists.
  _best for: Zeus botnet C2 blocking_
- [Malware Domains Blacklist](https://mirror1.malwaredomains.com/files/domains.txt) *(deprecated)*
  Historical malware domains blocklist providing hosts file format malicious domain list.
  _best for: Malware domain blocking (legacy)_
- [Blackweb](https://github.com/maravento/blackweb) (T)
  Open-source project consolidating public malware domain blacklists optimized for Squid-Cache compatibility.
  _best for: Squid proxy malware filtering_
- [Critical Stack Intel (R)](https://intel.criticalstack.com/) (T, R)
  Free threat intelligence feeds integrated with Bro/Zeek network security monitoring systems.
  _best for: Network IDS threat intelligence_
- [DNS Sinkhole](https://malc0de.com/bl/)
  Malware domain sinkhole from malc0de.com providing DNS-based threat blocking zones.
  _best for: DNS-based malware blocking_
- [DNS-BH Malware Domain Blocklist](https://www.malwaredomains.com/wordpress/?page_id=66) *(deprecated)*
  Legacy malware domain blocklist from RiskAnalytics using Black Hole DNS sinkhole technology.
  _best for: Malware domain blocking (legacy)_
- [Malware Domain List](https://www.malwaredomainlist.com/hostslist/hosts.txt)
  Interactive malware domain reputation lookup providing verified malicious domain intelligence.
  _best for: Malware domain reputation queries_
- [MalwareURL (R)](https://www.malwareurl.com/index.php)
  Commercial malware URL reputation checker and blocklist service protecting networks from known malicious websites.
  _pricing: freemium; best for: Malware URL reputation checking_
- [scumware.org](https://www.scumware.org/)
  Free malware and spyware tracking domain blacklist maintained by security community for 18+ years.
  _best for: Malware and spyware domain research_
- [ZeuS Tracker](https://zeustracker.abuse.ch/blocklist.php)
  abuse.ch project providing comprehensive tracking of Zeus botnet C2 infrastructure with domain and IP blocklists.
  _best for: Zeus botnet tracking and blocking_
- [Shadowserver Foundation](https://www.shadowserver.org/)
  Nonprofit providing comprehensive IP reputation intelligence and automated abuse reporting through daily network scanning.
  _best for: IP/domain reputation and abuse intelligence_
- [Email Domain Validation](https://www.mailboxvalidator.com/domain) (R)
  Free email domain validation tool checking DNS records, MX records, and mail server connectivity.
  _pricing: freemium; best for: Email domain and mailbox verification_

## Typosquatting
- [DNS Twist (T)](https://github.com/elceef/dnstwist) (T)
  Domain name permutation engine for detecting homograph phishing attacks and typosquatting with fuzzy hashing.
  _best for: Typosquatting and phishing domain detection_
- [URLCrazy (T)](https://www.morningstarsecurity.com/research/urlcrazy) (T)
  Ruby-based typosquatting domain generator supporting 15 variation types and 8000+ common misspellings.
  _best for: Typosquatting domain discovery_
- [dnstwister](https://dnstwister.report/)
  Web-based domain permutation tool with free lookup and paid monitoring plans for typosquatting detection.
  _pricing: freemium; best for: Typosquatting monitoring_
- [Catphish (T)](https://github.com/ring0lab/catphish) (T)
  Red team tool for generating phishing domains using homoglyphs, punycode, and domain manipulation techniques.
  _best for: Red team phishing domain generation_

## Analytics
- [BuiltWith](https://builtwith.com/)
  Web technology profiler identifying CMS platforms, frameworks, analytics, and 2500+ technologies used by websites.
  _pricing: freemium; best for: Web technology intelligence and competitive analysis_
- [SiteSleuth](https://www.sitesleuth.io/)
  OSINT domain analytics tool tracking Google Analytics, AdSense, and Stripe keys across 32+ million websites.
  _best for: Tracking code intelligence and related domain discovery_
- [Wappalyzer (T)](https://www.wappalyzer.com/) (T, R)
  Technology stack profiler that identifies CMS, frameworks, analytics, and infrastructure used by a website.
  _pricing: freemium; best for: Technology stack fingerprinting and recon_
- [SEMrush](https://www.semrush.com/) (R)
  SEO intelligence platform for domain analytics, keyword intelligence, backlinks, and competitor profiling.
  _pricing: paid; best for: Traffic and backlink competitive analysis_
- [Moonsearch](https://moonsearch.com/) (M) *(deprecated)*
  Legacy reverse-WHOIS style domain correlation service with unclear current availability.
  _best for: Historical domain ownership correlation_
- [Ewhois](https://www.ewhois.com/)
  Web WHOIS lookup utility for registration, registrar, and nameserver details.
  _best for: Quick WHOIS lookups_
- [StatsCrop](https://www.statscrop.com/)
  Website statistics portal with traffic rank snapshots and related metadata.
  _best for: Quick website popularity snapshots_
- [Open Site Explorer](https://moz.com/link-explorer) (R, M) *(deprecated)*
  Legacy Moz Open Site Explorer entry now represented by Moz Link Explorer for backlink analysis.
  _pricing: freemium; best for: Backlink and linking-domain analysis_
- [SpyOnWeb](https://www.spyonweb.com/) (R)
  Correlation tool that links domains by shared tracking and advertising identifiers.
  _pricing: freemium; best for: Finding related infrastructure via shared IDs_
- [Keyword Density](https://tools.seobook.com/general/keyword-density/)
  Text and page analyzer that measures keyword frequency and relative density.
  _best for: On-page keyword frequency analysis_
- [Alexa Site Statistics](https://alexa.amazon.com/about) (M) *(deprecated)*
  Historical Alexa Internet traffic-statistics entry; service was discontinued in 2022.
  _best for: Historical reference only_
- [Cisco Umbrella Popularity List](https://s3-us-west-1.amazonaws.com/umbrella-static/index.html)
  Domain popularity ranking based on Cisco Umbrella DNS telemetry.
  _best for: Top-domain popularity and DNS trend context_
- [Alexa Top 500 Global Sites](https://alexa.amazon.com/about) (M) *(deprecated)*
  Historical Alexa Top Sites list reference; no longer maintained after Alexa shutdown.
  _best for: Historical popularity-list reference_
- [Sitedossier](https://www.sitedossier.com/)
  Domain dossier aggregator with WHOIS, DNS, and linked infrastructure context.
  _best for: Quick domain intelligence aggregation_
- [Visual Site Mapper](https://github.com/alentum/sitemapper-nodejs) (T)
  Site-crawling mapper used to visualize website structure and page relationships.
  _best for: Generating website structure maps_
- [ClearWebStats.com](https://www.clearwebstats.com/)
  Public site-statistics index showing traffic and rank snapshots for domains.
  _best for: Lightweight web popularity lookups_
- [PubDB](https://pub-db.com/) (M) *(deprecated)*
  Legacy public-database lookup entry with expired or unavailable service state.
  _best for: Historical reference only_
- [SimilarWeb](https://www.similarweb.com/) (R)
  Digital intelligence platform for traffic estimates, referrals, and audience insights.
  _pricing: freemium; best for: Competitor traffic and referral analysis_
- [Siteliner](https://www.siteliner.com/) (R)
  Website crawler that highlights duplicate content, broken links, and SEO quality issues.
  _pricing: freemium; best for: Duplicate-content and link-health audits_
- [WhatWeb](https://github.com/urbanadventurer/WhatWeb) (T)
  Open-source fingerprinting scanner for identifying technologies, frameworks, and server-side indicators.
  _best for: CLI-based web technology fingerprinting_

## URL Expanders
- [Link Expander](https://www.linkexpander.com/)
  Short-link expansion tool that resolves redirects to destination URLs.
  _best for: Expanding shortened links safely_
- [CheckShortURL](https://checkshorturl.com/)
  Preview service for shortened URLs with destination and threat-check context.
  _best for: Safe short-link destination checks_
- [URL Expander](https://urlex.org/)
  Link resolver for unshortening and inspecting redirect destination chains.
  _best for: Resolving opaque short links_
- [Where Does This Link Go?](https://wheregoes.com/)
  Redirect-chain inspector that traces and visualizes final destination paths.
  _best for: Tracing redirect chains for suspicious links_
- [KnowURL](https://www.knowurl.com/) (M) *(deprecated)*
  Legacy URL intelligence entry with uncertain availability and reliability.
  _best for: Historical reference only_

## Change Detection
- [VisualPing](https://visualping.io/) (R)
  Website monitoring platform that alerts on page content or visual changes.
  _pricing: freemium; best for: Automated webpage change monitoring_
- [Change Detection](https://changedetection.io/) (T)
  Open-source change-monitoring system for tracking updates on websites over time.
  _best for: Self-hosted page change monitoring_
- [UPcheck](https://upcheck.online/) *(deprecated)*
  Website uptime checker that tests if a site is currently accessible.
  _best for: Quick site availability checks_
- [Follow That Page](https://www.followthatpage.com/) (R)
  Website monitoring service that checks pages for changes and sends alerts when tracked content updates. Supports keyword-based notifications for focused monitoring.
  _pricing: freemium; best for: Tracking updates on specific web pages by keyword_
- [Urlwatch](https://github.com/thp/urlwatch) (T, M)
  Open-source Python CLI tool for monitoring webpages and feeds for changes. Supports multiple filters, reporters, and scheduled checks via local automation.
  _best for: Self-hosted web page change monitoring automation_
- [WatchThatPage](https://watchthatpage.com/) (R)
  Web-based page monitoring platform that detects content changes and notifies users by email. Useful for tracking updates on websites without RSS feeds.
  _pricing: freemium; best for: Monitoring static web pages for updates over time_
- [ChangeDetect](https://changedetection.io/) (T, M)
  Open-source website change detection platform with both self-hosted and hosted options. Supports visual diffs, notifications, and automation workflows.
  _pricing: freemium; best for: Flexible page change monitoring with self-hosted control_

## Social Analysis
- [Google Trends](https://trends.google.com/trends/)
  Google's search trend analysis tool for tracking keyword popularity and comparing search interest over time.
  _best for: Search trend analysis and keyword research_

## DNSSEC
- [DNSSEC Analyzer](https://dnssec-analyzer.verisignlabs.com/)
  Verisign's DNSSEC validation tool that checks the DNSSEC chain of trust for a domain.
  _best for: DNSSEC chain-of-trust validation_
- [DNSViz](https://dnsviz.net/)
  DNS and DNSSEC analysis platform that visualizes delegation chains and cryptographic validation paths. Helps diagnose trust and signing issues in domain configurations.
  _best for: Visual DNSSEC validation and DNS misconfiguration analysis_

## Vulnerabilities

### Scanners
- [Sn1per (T)](https://github.com/1N3/Sn1per) (T)
  Automated reconnaissance and penetration testing framework combining multiple scanning tools for full-scope target enumeration.
  _best for: Full-scope pentest automation and recon_
- [Online Nikto scanner](https://nikto.online/)
  Hosted version of the Nikto web server scanner for identifying vulnerabilities, misconfigurations, and exposed files.
  _best for: Web server vulnerability scanning_
- [Web Data Exposure Scanner (T)](https://github.com/eduardoit/web-data-exposure-scanner) (T)
  Open-source scanner for detecting exposed web application data and sensitive file disclosures on web servers.
  _best for: Detecting exposed sensitive data on web servers_

### Disclosure Sites
- [Zone-H.org](https://zone-h.org/archive)
  Archive of reported website defacements and related incident metadata maintained by the Zone-H community.
  _best for: Historical tracking of website defacement incidents_
- [RobotsDisallowed](https://github.com/danielmiessler/RobotsDisallowed) (T)
  Curated wordlist of top disallowed paths harvested from robots.txt files across high-traffic websites.
  _best for: robots.txt enumeration and directory discovery_

## Tools
- [Belati (T)](https://github.com/aancw/Belati) (T)
  Open-source OSINT data collection and automation framework for gathering information from multiple sources.
  _best for: Multi-source OSINT collection automation_
- [Burp Suite (T)](https://portswigger.net/burp) (T)
  Industry-standard web application security testing platform for manual and automated vulnerability assessment.
  _pricing: freemium; best for: Web application penetration testing_
- [EyeWitness (T)](https://github.com/ChrisTruncer/EyeWitness) (T)
  Open-source tool for automated website screenshotting, service header collection, and default credential identification.
  _best for: Visual site enumeration and credential identification_
- [Hunting-New-Registered-Domains (T)](https://github.com/gfek/Hunting-New-Registered-Domains) (T)
  Open-source tool for identifying newly registered domains matching patterns, useful for phishing and brand threat detection.
  _best for: Phishing domain detection and brand threat monitoring_
- [International Domain Name Conversion Tool](https://mct.verisign-grs.com/)
  Verisign's IDN/Punycode bidirectional converter for translating international domain names to and from ASCII-compatible encoding.
  _best for: IDN and Punycode domain analysis_
- [Online Nikto scanner](https://nikto.online/)
  Hosted version of the Nikto web server scanner for identifying vulnerabilities, misconfigurations, and exposed files.
  _best for: Web server vulnerability scanning_

## Report Malicious Sites
- [Windows Defender Security Intelligence (WDSI)](https://www.microsoft.com/en-us/wdsi)
  Microsoft's security intelligence portal for reporting malicious URLs and checking Windows Defender threat assessments.
  _best for: Reporting malicious sites to Microsoft and checking URL threat status_
- [Google Safe Browsing](https://safebrowsing.google.com/) (D)
  Google's phishing and malware reporting portal for submitting suspicious URLs for review.
  _best for: Reporting malicious sites to Google and checking URL safety status_

# Cloud Infrastructure

## AWS Enumeration
- [AWSBucketDump (T)](https://github.com/jordanpotti/AWSBucketDump) (T)
  Python tool that enumerates AWS S3 buckets and optionally downloads accessible objects using keyword and pattern-based discovery.
  _best for: Targeted S3 bucket discovery and object collection_
- [cloud_enum (T)](https://github.com/initstring/cloud_enum) (T)
  Multi-cloud enumeration tool that looks for exposed AWS, Azure, and GCP storage assets from target naming patterns.
  _best for: Rapid discovery of cloud storage exposure across major providers_
- [Subfinder (T)](https://github.com/projectdiscovery/subfinder) (T, R)
  Fast passive subdomain discovery utility that aggregates results from many curated OSINT and API-backed sources.
  _best for: Passive subdomain enumeration for cloud asset inventorying_

## Azure/GCP Discovery
- [AADInternals (T)](https://github.com/Gerenios/AADInternals) (T)
  PowerShell toolkit for Azure AD and Entra ID assessment, including tenant reconnaissance and hybrid identity attack-path analysis.
  _best for: Deep Azure AD reconnaissance and security assessment_
- [GCPBucketBrute (T)](https://github.com/RhinoSecurityLabs/GCPBucketBrute) (T)
  Google Cloud Storage bucket enumeration utility for identifying publicly accessible or weakly protected buckets.
  _best for: Enumerating likely GCS bucket names at scale_
- [MicroBurst (T)](https://github.com/NetSPI/MicroBurst) (T)
  PowerShell collection focused on Azure security assessment, including subscription discovery and cloud service misconfiguration checks.
  _best for: Azure subscription and service-level exposure testing_
- [ROADtools (T)](https://github.com/dirkjanm/roadtools) (T)
  Azure AD exploration framework for dumping tenant objects, principals, and permissions to support attack-path and privilege analysis.
  _best for: Enumerating Azure AD objects and privilege relationships_
- [Stormspotter (T)](https://github.com/Azure/Stormspotter) (T)
  Graph-based Azure reconnaissance platform that maps cloud attack paths and trust relationships using Neo4j-backed visualization.
  _best for: Visual analysis of Azure attack paths and privilege chains_

## S3/Blob Storage
- [BucketLoot (T)](https://github.com/redhuntlabs/BucketLoot) (T)
  Open-source cloud bucket discovery utility with limited current documentation and unclear maintenance signals.
  _best for: Supplemental bucket discovery when validating legacy workflows_
- [goblob (T)](https://github.com/Macmod/goblob) (T)
  Go-based Azure blob storage enumeration utility designed for fast discovery of publicly exposed containers and blobs.
  _best for: Enumerating Azure blob container exposure quickly_
- [lazys3 (T)](https://github.com/nahamsec/lazys3) (T)
  S3 bucket brute-forcing utility that generates candidate names from permutations and checks bucket accessibility.
  _best for: Quick permutation-based S3 bucket name discovery_
- [Public Buckets](https://buckets.grayhatwarfare.com/) (R)
  Search interface for publicly indexed cloud object storage buckets and files across multiple providers.
  _pricing: freemium; best for: Investigating exposed bucket contents without running local scanners_
- [S3Scanner (T)](https://github.com/sa7mon/s3scanner) (T)
  Command-line scanner for enumerating and checking S3 bucket misconfigurations across AWS and compatible object storage services.
  _best for: Validating bucket exposure and permissions across S3-compatible targets_

## Cloud Configuration Analysis
- [Checkov (T)](https://github.com/bridgecrewio/checkov) (T)
  Infrastructure-as-code security scanner that checks Terraform, CloudFormation, Kubernetes, and other cloud configs against policy rules.
  _best for: Shift-left cloud misconfiguration detection in IaC repositories_
- [Cloud Custodian (T)](https://github.com/cloud-custodian/cloud-custodian) (T)
  Policy-as-code engine for cloud governance and security that can detect and remediate risky cloud configurations.
  _best for: Automated cloud governance and continuous configuration enforcement_
- [Prowler (T)](https://github.com/prowler-cloud/prowler) (T)
  Cloud security posture and compliance assessment framework covering AWS, Azure, GCP, Kubernetes, and SaaS surfaces.
  _pricing: freemium; best for: Broad cloud security and compliance baseline assessments_
- [ScoutSuite (T)](https://github.com/nccgroup/ScoutSuite) (T)
  Multi-cloud auditing tool that inventories cloud resources and highlights security risks in an interactive HTML report.
  _best for: Snapshot-style multi-cloud security posture reviews_
- [Steampipe (T)](https://github.com/turbot/steampipe) (T)
  SQL interface over cloud APIs and services, enabling ad hoc querying of AWS, Azure, GCP, and many other data sources.
  _pricing: freemium; best for: SQL-driven cloud inventory and security query workflows_

## SaaS Footprinting
- [Amass (T)](https://github.com/owasp-amass/amass) (T, R)
  Advanced attack surface mapping framework for DNS and subdomain enumeration with graph correlation and extensive data-source support.
  _best for: Comprehensive external attack-surface and subdomain mapping_
- [dnsrecon (T)](https://github.com/darkoperator/dnsrecon) (T)
  DNS enumeration script for recon workflows, supporting record discovery, zone transfer checks, brute-force, and reverse lookups.
  _best for: Detailed DNS reconnaissance and validation_
- [SpiderFoot (T)](https://github.com/smicallef/spiderfoot) (T)
  Automated OSINT collection tool with 200+ modules for reconnaissance and threat intelligence.
  _best for: Automated recon, attack surface mapping, threat intelligence_
- [Sublist3r (T)](https://github.com/aboul3la/Sublist3r) (T)
  Passive subdomain enumeration tool that aggregates subdomains from public search engines and certificate-related sources.
  _best for: Quick passive subdomain discovery for reconnaissance_
- [theHarvester (T)](https://github.com/laramies/theHarvester) (T)
  Reconnaissance tool for gathering emails, domains, hosts, and employee-related intelligence from public search and data sources.
  _best for: Email and host discovery tied to a target organization_

# IP & MAC Address

## Geolocation
- [MaxMind Demo](https://www.maxmind.com/en/home)
  Web-based IP geolocation demo with location, ASN, and network data from MaxMind's GeoIP database.
  _best for: Quick IP geolocation_
- [IPv4/IPv6 lists by country code](https://github.com/ipverse/) (M)
  Database of IPv4 and IPv6 address ranges organized by country for geographic IP filtering.
  _best for: Country-level IP enumeration_
- [IP2Location.com](https://www.ip2location.com/demo) (R)
  Commercial IP geolocation service with free demo and database. Provides location, proxy detection, and network data.
  _pricing: freemium; best for: Accurate geolocation with proxy detection_
- [IP Fingerprints](https://ipfingerprints.com/)
  Reverse IP lookup service identifying all domains hosted on a given IP address.
  _best for: Find domains on shared hosting_
- [DB-IP](https://db-ip.com/)
  Lightweight IP geolocation API covering 46M+ IPv4/IPv6 blocks with city-level accuracy.
  _pricing: freemium; best for: Accurate IP geolocation with developer API_
- [IP Location Finder](https://www.iplocation.net/)
  Web-based tool for IP geolocation with maps and detailed location information.
  _best for: Quick IP location with maps_
- [Info Sniper](https://www.infosniper.net/) (R)
  Multi-field reverse OSINT tool for IP, email, phone lookups with social media enumeration.
  _pricing: freemium; best for: Multi-field reverse lookup (IP/email/phone)_
- [utrace](https://en.utrace.de/)
  IP geolocation and reverse DNS lookup tool with network traceroute visualization.
  _best for: IP location and traceroute_

## Host / Port Discovery
- [urlscan.io](https://urlscan.io/search/#*)
  Website scanner analyzing URLs and domains for malicious content with infrastructure intelligence.
  _pricing: freemium; best for: URL/domain scanning for malware and phishing_
- [Spyse](https://spyse.com/search/ip) (R)
  Internet assets search engine collecting and analyzing public data for attack surface management.
  _pricing: freemium; best for: Internet asset discovery and reconnaissance_
- [Shodan](https://www.shodan.io/) (R)
  Search engine for internet-connected devices, providing visibility into exposed services and vulnerabilities.
  _pricing: freemium; best for: Find exposed IoT and network services_
- [Netlas.io](https://netlas.io/) (R)
  Comprehensive internet scanning platform with OSINT, DNS, and WHOIS data. Free tier: 50 requests/day.
  _pricing: freemium; best for: Internet asset reconnaissance with web, DNS, WHOIS_
- [Portmap](https://portmap.com/)
  Port mapping tool that scans for open ports and services on target IP addresses.
  _best for: Port scanning and service discovery_
- [Scans.io](https://scans.io/)
  Archive of internet-wide scan data including censys scans and other reconnaissance data.
  _best for: Historical internet scan data access_
- [Nmap (T)](https://nmap.org/download.html) (T)
  Open-source network mapping and port scanning tool with OS detection and service version identification.
  _best for: Network reconnaissance and port scanning_
- [Online Port scanner](https://portscanner.online/)
  Web-based port scanner checking open ports on target IP addresses without installation.
  _best for: Quick port scanning without tools_
- [Internet Census Search](https://www.exfiltrated.com/querystart.php)
  Search interface for the Shodan-like internet census data and open services.
  _best for: Search open services and devices_
- [Criminal IP Search](https://www.criminalip.io/) (R)
  IP reputation and threat intelligence platform analyzing malicious IP addresses and attacks.
  _pricing: freemium; best for: IP reputation and malicious activity analysis_
- [Scanless (T)](https://github.com/vesche/scanless) (T)
  Command-line tool for port scanning without leaving traces on target using third-party services.
  _best for: Stealthy port scanning via proxies_
- [BinaryEdge (R)](https://www.binaryedge.io/) (R)
  Commercial security research platform with internet-wide scanning and module-based detection.
  _pricing: paid; best for: Commercial internet threat intelligence_
- [Masscan (T)](https://github.com/robertdavidgraham/masscan) (T)
  Ultra-fast TCP port scanner designed for scanning large IP ranges and entire networks.
  _best for: Large-scale network port scanning_

## IPv4
- [ASlookup.com](https://aslookup.com/) (M)
  BGP and autonomous system lookup tool for finding IP ranges and ownership information.
  _best for: BGP and ASN lookup_
- [Port scanner Online](https://portscanner.online/)
  Simple web-based port scanner for checking common ports on target IPs.
  _best for: Quick port availability checks_
- [Onyphe](https://www.onyphe.io/) (R)
  Cyber defense search engine with internet scanning, threat intelligence, and attack surface management.
  _pricing: freemium; best for: Internet asset discovery and threat intel_
- [IPv4 CIDR Report](https://www.cidr-report.org/as2.0/)
  Tool for analyzing IPv4 CIDR blocks and finding contained IP addresses and subnets.
  _best for: CIDR block analysis and subnet enumeration_
- [Reverse.report](https://reverse.report/) (R)
  Comprehensive reverse lookup tool for IP to domain, email, and phone number associations.
  _pricing: freemium; best for: Reverse IP and domain lookups_
- [Team Cymru IP to ASN](https://asn.cymru.com/)
  IP to ASN mapping tool providing autonomous system ownership and prefix information.
  _best for: IP to ASN mapping_
- [IP to ASN DB](https://iptoasn.com/)
  Database and API service for looking up which ASN owns a given IP address.
  _best for: IP to ASN lookup with historical data_
- [Hacker Target - Reverse DNS](https://hackertarget.com/reverse-dns-lookup/)
  Reverse DNS lookup tool and API finding domain names associated with IP addresses.
  _pricing: freemium; best for: Reverse DNS lookup of IP addresses_

## IPv6
- [IPv6 CIDR Report](https://www.cidr-report.org/v6/as2.0/)
  CIDR block analysis tool for IPv6 address ranges and subnet enumeration.
  _best for: IPv6 CIDR block analysis_

## BGP
- [Hurricane Electric BGP Toolkit](https://bgp.he.net/)
  BGP and network routing analysis tools including AS to prefix lookup and BGP prefix information.
  _best for: BGP analysis and routing intelligence_
- [BGP Malicious Content Ranking](https://bgpranking.circl.lu/)
  Platform ranking ASNs and BGP prefixes by malicious content and security threats.
  _best for: Identify malicious ASNs and networks_
- [PeeringDB](https://www.peeringdb.com/advanced_search)
  Database of internet exchange points, member networks, and AS relationships for network mapping.
  _best for: Internet peering and AS relationship mapping_
- [BGP Tools](https://www.bgp4.as/tools) (M)
  Collection of BGP analysis and AS number lookup tools for network intelligence.
  _best for: BGP routing and AS analysis_

## Reputation
- [IP Void](https://www.ipvoid.com/) (R)
  IP reputation and threat intelligence service analyzing blacklist status and security risks.
  _pricing: freemium; best for: Check IP reputation and blacklist status_
- [ExoneraTor](https://exonerator.torproject.org/)
  Tool for checking if an IP address belonged to Tor at a specific date.
  _best for: Verify Tor relay membership by date_
- [Grey Noise](https://viz.greynoise.io/) (R)
  Platform for analyzing internet background noise and identifying benign scanning activity.
  _pricing: freemium; best for: Distinguish malicious from benign internet activity_

## Blacklists
- [Blocklist.de](https://www.blocklist.de/en/index.html)
  Community-contributed blocklist of IP addresses involved in attacks and malicious activity.
  _best for: Check IP blacklist status_
- [DShield API](https://isc.sans.edu/api/)
  API and database of security events and IPs involved in attacks monitored by SANS.
  _best for: Query IPs involved in attacks_
- [FireHOL IP Lists](https://iplists.firehol.org/)
  Collection of firewall-friendly IP lists for blocking malicious and spam sources.
  _best for: Block malicious/spam IP sources_
- [Project Honey Pot](https://www.projecthoneypot.org/list_of_ips.php)
  Global honeypot network collecting spam and attack data with IP reputation service.
  _pricing: freemium; best for: Check IP for spam and attack history_

## Neighbor Domains
- [IP Fingerprints - Reverse IP Lookup](https://ipfingerprints.com/reverseip.php)
  Find all domains hosted on a shared IP address through reverse IP lookup.
  _best for: Find domains on shared hosting_
- [Bing IP Search (D)](https://www.bing.com/search?q=ip%3A8.8.8.8) (D)
  Bing search operator for finding domains and subdomains hosted on a specific IP address.
  _best for: Find domains on IP using Bing index_
- [TCP/IP Utils - Domain Neighbors](https://dnslytics.com/)
  Find all domains on the same IP and subdomain information via reverse IP lookups.
  _best for: Identify related domains on same IP_
- [MyIPNeighbors](https://www.my-ip-neighbors.com/)
  Reverse IP lookup tool for discovering all domains and subdomains on an IP address.
  _best for: Find all domains on same shared IP_

## Protected by Cloud Services
- [CloudFlare Watch](https://www.crimeflare.com/)
  Tool for identifying and analyzing websites protected by Cloudflare's CDN and security services.
  _best for: Identify Cloudflare-protected sites_
- [CloudFail (T)](https://github.com/m0rtem/CloudFail) (T)
  Tool for finding origin IPs of Cloudflare-protected websites through enumeration techniques.
  _best for: Bypass Cloudflare to find origin IP_

## Wireless Network Info
- [WiGLE: Wireless Network Mapping](https://wigle.net/) (R)
  Global database of wireless networks (WiFi, Bluetooth, cellular) with mapping and signal strength data.
  _pricing: freemium; best for: Map wireless networks and find signal coverage_
- [OpenCellid: Database of Cell Towers](https://opencellid.org/)
  Open database of cellular tower locations and coverage for mobile network geolocation.
  _best for: Find cellular tower locations and coverage_

## Network Analysis Tools
- [Wireshark](https://www.wireshark.org/download.html) (T)
  Open-source network packet analyzer for deep packet inspection and network troubleshooting.
  _best for: Network packet analysis and protocol debugging_
- [NetworkMiner](https://www.netresec.com/?page=Networkminer) (T)
  Passive network forensics tool for extracting files and data from network traffic captures.
  _best for: Network forensics and file extraction from traffic_
- [Packet Total](https://www.packettotal.com/) (R)
  Online platform for uploading and analyzing network packet captures (PCAP files).
  _best for: Cloud-based network forensics analysis_
- [checkip (T)](https://github.com/jreisinger/checkip) (T)
  Command-line utility for checking local machine IP address and network connectivity.
  _best for: Display local IP and network info_

## IP Loggers
- [Ki.tc](https://ki.tc)
  IP logging service that generates trackable links for IP/browser info collection.
  _best for: Generate trackable links to log visitor IPs_
- [Grabify](https://grabify.link)
  URL shortener service that logs IP addresses and device information of link clickers.
  _best for: Shorten URLs and log visitor IPs_
- [IP Logger](https://iplogger.com/)
  IP logging and URL shortening service tracking visitor IP, location, and browser data.
  _best for: Track visitor IPs through shortened links_

# Images / Videos / Docs

## Images

### Search
- [Google Images](https://images.google.com/)
  Google's reverse image and visual search via Lens for finding matches, source pages, and related images across the web.
  _best for: Broad reverse image search and source discovery_
- [Bing Images](https://www.bing.com/images)
  Microsoft visual search engine with reverse image lookup and crop-based matching for partial-object analysis.
  _best for: Cropped reverse-image matching and visual component analysis_
- [FaceCheck Facial Recognition Search](https://facecheck.id/) (R)
  Facial recognition search engine that finds publicly indexed face matches across web and social sources.
  _pricing: freemium; best for: Finding public social profiles by face image_
- [Surfface Face & People Search Engine](https://surfface.com/) (R)
  AI-based face and people search platform focused on open-source identity discovery and correlation.
  _pricing: freemium; best for: Identity correlation from face imagery_
- [PimEyes Face Search Engine](https://pimeyes.com/en) (R)
  Commercial reverse face search engine for locating appearances of a face on publicly indexed websites.
  _pricing: freemium; best for: High-coverage reverse face search investigations_
- [Yandex Images](https://yandex.com/images/)
  Reverse image search engine with strong matching for Eastern European and Asian web sources.
  _best for: Finding non-Western image sources and modified variants_
- [Baidu Images](https://image.baidu.com/)
  Chinese reverse image search platform useful for discovering image reuse on China-centric websites.
  _best for: China-specific image source discovery_
- [Twitter Image Search (M)](https://twitter.com/search?q=%3Csearchterm%3E&src=typd&vertical=default&f=images) (M)
  Manual X/Twitter query template for finding tweets containing images for a target keyword or account.
  _best for: Finding image-containing tweets by keyword or operator_
- [Imgur Search](https://imgur.com/search)
  Search interface for Imgur-hosted public images, albums, and community media posts.
  _pricing: freemium; best for: Locating reposted images and public gallery content on Imgur_
- [Photobucket](https://photobucket.com/)
  Long-running image hosting platform with public galleries and legacy web-hosted photo content.
  _pricing: freemium; best for: Finding legacy hosted images and user gallery artifacts_
- [7Photos.net](https://7photos.net/) (R)
  Unclear image-related web service with an active domain but limited publicly verifiable functionality.
  _pricing: unknown; best for: Unknown; requires additional validation before operational use_
- [Current Location](https://current-location.com/)
  Location-based photo discovery tool that aggregates geotagged images from public platforms on an interactive map.
  _best for: Discovering geotagged photos near a location of interest_
- [Lenso.ai](https://lenso.ai/) (R)
  AI reverse image and face matching platform designed to find similar or edited visual content.
  _pricing: freemium; best for: Matching altered or low-quality images and face lookups_
- [CC Search](https://search.creativecommons.org/)
  Creative Commons search portal for discovering openly licensed and public-domain images.
  _best for: Finding license-safe imagery and attribution-ready sources_
- [CamFind App](https://camfindapp.com/)
  Mobile visual search app that identifies objects, landmarks, and products from photos.
  _pricing: freemium; best for: On-device object identification and quick visual lookups_
- [RevEye Reverse Image Search (T)](https://github.com/steven2358/reveye) (T)
  Open-source browser extension that launches reverse image searches across multiple engines from one menu.
  _best for: Multi-engine reverse image pivoting from a single browser action_
- [SmugMug Search](https://www.smugmug.com/)
  Photo hosting and portfolio platform with searchable public galleries and photographer profiles.
  _pricing: freemium; best for: Finding public photographer portfolios and gallery artifacts_
- [ImageNet](https://image-net.org/) (T)
  Large-scale labeled image dataset used for computer vision and image classification research.
  _best for: Reference classification sets and ML-oriented visual taxonomy work_
- [Places2](http://places2.csail.mit.edu/) (T)
  MIT CSAIL scene-recognition dataset containing millions of place-labeled images for visual analysis.
  _best for: Scene classification reference and location-context model training_
- [Image Identification Project](https://www.imageidentify.com/)
  Online image recognition service that labels uploaded images with machine-generated tags and confidence scores.
  _pricing: freemium; best for: Quick machine-labeling of unknown image content_
- [SauceNAO](https://saucenao.com/)
  Reverse image source finder widely used to trace artwork, anime frames, and reposted media to origin sites.
  _pricing: freemium; best for: Tracing image origins and duplicate postings_
- [Picarta](https://picarta.ai/)
  AI geolocation tool that estimates likely photo capture locations from visual scene analysis.
  _pricing: freemium; best for: Estimating geographic origin of photos without metadata_
- [FaceSeek Face Search Engine](https://www.faceseek.online/)
  Face-matching web tool for locating visually similar faces across indexed online content.
  _pricing: freemium; best for: Supplemental reverse face lookup and comparison_

### Instagram
- [Webstigram](https://websta.me/search-engine-optimization/) (M) *(deprecated)*
  Legacy Webstagram endpoint historically used for Instagram search workflows; currently not verifiable as a standalone active OSINT tool.
  _best for: Historical reference while migrating to active Instagram tooling_
- [Instagram](https://www.instagram.com/) (R, M)
  Main Instagram platform used for public profile, hashtag, and location OSINT collection.
  _pricing: freemium; best for: Social profiling and image discovery_
- [Mini Instagram](https://mini-for-instagram.en.softonic.com/) (T)
  Lightweight Instagram client utility used to simplify media viewing and downloading workflows.
  _best for: Preserving Instagram media for offline review_
- [Imgrab](https://www.imgrab.com/) (T)
  Image download utility family used for saving individual or batch media from web pages.
  _best for: Batch image capture and archive building_
- [Tofo.me](https://tofo.me/) (M) *(deprecated)*
  Legacy Instagram-related endpoint with unclear current functionality and limited verifiable OSINT value.
  _best for: Historical reference only_

### Flickr
- [Flickr](https://www.flickr.com/) (M)
  Photo hosting platform that often preserves useful image metadata and geotags for OSINT workflows.
  _pricing: freemium; best for: Image metadata and geolocation investigation_
- [Flickr Map](https://www.flickr.com/map/) (M)
  Flickr map interface for browsing geotagged photos by area and time.
  _best for: Map-based discovery of geotagged Flickr images_
- [My Pics Map](https://www.mypicsmap.com/) (M) *(deprecated)*
  Photo mapping utility reference with unclear present-day availability as a distinct OSINT tool.
  _best for: Historical reference for photo geotag visualization_
- [idGettr](https://www.webfx.com/tools/idgettr/)
  Web utility for resolving Instagram usernames to numeric account IDs.
  _best for: Converting Instagram handles into numeric IDs for follow-on tooling_
- [Flickr Hive Mind](https://flickrhivemind.net/) (M)
  Advanced Flickr search and data-mining interface for tags, users, text, and date filters.
  _best for: Targeted Flickr dataset discovery and batch result review_

### Metadata
- [ExifEditor](https://exifeditor.io)
  Browser-based EXIF metadata viewer and editor for quick image metadata inspection or sanitization.
  _best for: Fast EXIF inspection and metadata cleanup in-browser_
- [ExifTool (T)](https://exiftool.org/) (T)
  Widely used command-line toolkit for reading and writing EXIF, IPTC, XMP, and other metadata formats.
  _best for: Comprehensive multi-format metadata extraction_
- [ExifViewer](https://www.exifviewer.org/)
  Online EXIF inspection utility for camera, location, and embedded image metadata fields.
  _best for: Quick EXIF inspection without local CLI tools_
- [FOCA (T)](https://github.com/ElevenPaths/FOCA) (T)
  Desktop reconnaissance tool that gathers public documents from target domains and extracts embedded metadata.
  _best for: Corporate document metadata reconnaissance_
- [GeoSetter](https://geosetter.de/en/main-en/) (T)
  Windows desktop utility for viewing and editing photo geotags and EXIF/XMP metadata fields in bulk.
  _best for: Bulk geolocation metadata review and correction_
- [Jeffrey's Exif Viewer](https://regex.info/blog/) *(deprecated)*
  Formerly popular EXIF web viewer that is now discontinued and kept as historical reference.
  _best for: Historical reference only_
- [JPEGsnoop (T)](https://www.impulseadventure.com/photo/jpeg-snoop.html) (T)
  Windows forensic utility for deep JPEG structure analysis, recompression detection, and authenticity clues.
  _best for: JPEG forensic analysis and tamper signal detection_
- [Metapicz](https://metapicz.com/#landing) *(deprecated)*
  Online EXIF parser historically used for quick camera and location metadata reads, now showing signs of limited maintenance.
  _best for: Legacy metadata checks when primary tools are unavailable_
- [Search by Exif](https://exif.osint-tool.com)
  Web EXIF inspection tool focused on extracting metadata and GPS clues from supplied images.
  _best for: Rapid EXIF and geolocation extraction_
- [xeuledoc - Fetch metadata about any public Google document](https://github.com/Malfrats/xeuledoc) (T)
  Python tool that extracts metadata from public Google Docs, Sheets, and Slides links.
  _best for: Google document attribution and metadata extraction_
- [Exiv2 (T)](https://exiv2.org/) (T)
  Cross-platform library and CLI for reading and modifying EXIF, IPTC, XMP, and ICC metadata.
  _best for: Programmatic metadata parsing and editing pipelines_
- [MediaInfo (T)](https://mediaarea.net/en/MediaInfo) (T)
  Cross-platform utility for extracting technical metadata from video and audio media files.
  _best for: Media codec and container metadata profiling_
- [Apache Tika (T)](https://tika.apache.org/) (T)
  Apache content analysis framework for extracting metadata and text across a very broad set of file formats.
  _best for: Scalable metadata extraction across heterogeneous document sets_
- [oletools (T)](https://github.com/decalage2/oletools) (T)
  Python toolkit for analyzing OLE and Office documents, including macro extraction and suspicious object detection.
  _best for: Office document security triage and embedded code inspection_
- [Hachoir (T)](https://hachoir.readthedocs.io/)
- [C2PA Verify](https://c2paviewer.com/)
- [Metadata2Go](https://www.metadata2go.com/)

### Forensics
- [Ghiro (T)](https://getghiro.org/)
- [Forensically](https://29a.ch/photo-forensics/)

### OCR
- [i2OCR](https://www.i2ocr.com/)
- [New OCR](https://www.newocr.com/)
- [Online OCR](https://www.onlineocr.net/)

### Tools
- [Creepy (T)](https://github.com/ilektrojohn/creepy)

## Videos

### Search
- [Google Videos](https://www.google.com/videohp)
- [Bing Videos](https://www.bing.com/videos)
- [Internet Archive Videos](https://archive.org/details/movies)
- [Vines (D)](https://www.google.com/search?q=site:vine.co+%3Csearchterm%3E)
- [Dogpile](https://www.dogpile.com/)
- [Geo Search Tool](https://youtube.github.io/geo-search-tool/)
- [blinkx Video Search](https://blinkx.com/)
- [Facebook Live Map](https://facebook.com/live)
- [LiveLeak (D)](https://www.liveleak.com/)
- [Metatube](https://github.com/JVT038/MetaTube)
- [Yahoo Video Search](https://video.search.yahoo.com/)
- [Search YouTube by Location](https://mattw.io/youtube-geofind/)

### Analyze / Record
- [Print YouTube StoryBoard Instructions](https://www.labnol.org/internet/print-youtube-video/28217)
- [Print Storyboard from Youtube](javascript:(function(){a=ytplayer.config.args.storyboard_spec;if(!a){alert("Sorry we cannot process this YouTube video. Could you please try another one");exit();}b=a.split("|");base=b[0].split("$")[0]+"2/M";c=b[3].split("%23");sigh=c[c.length-1];var imgs="";t=ytplayer.config.args.length_seconds;n=Math.ceil(c[2]/(c[3]*c[4]));for(i=0;i<n;i++){imgs+="<PICTURE='"+base+i+".jpg%3Fsigh="+sigh+"'><br/>";}var title=ytplayer.config.args.title;msg="<body style='background-color:#444;color:#eee;margin:20px%20auto;width:90%;text-align:center'%3E%3Ch2%3ETITLE%3C/h2%3E%3Cdiv%3EIMAGES%3C/div%3E%3Cbr/%3E%3Cem%3E%3Ca%20href='http://labnol.org/?p=28217'%20style='text-decoration:none;color:#fff;font-style:bold'%3EPrinted%20using%20the%20YouTube%20bookmarklet.%3C/a%3E%3C/em%3E%3C/body%3E%22;msg=msg.replace(%22TITLE%22,title).replace(%22IMAGES%22,imgs).replace(/PICTURE/g,%22img%20src%22);var%20labnol=window.open();labnol.document.open();labnol.document.write(msg);labnol.document.close();})();)
- [Frame by Frame for YouTube (T)](https://chrome.google.com/webstore/detail/frame-by-frame-for-youtub/elkadbdicdciddfkdpmaolomehalghio?hl=en-GB)
- [TubeChop](https://tubechop.com/)
- [YouTube Data Tools](https://tools.digitalmethods.net/netvizz/youtube/)
- [Hooktube](https://hooktube.com/)
- [yasiv-youtube](https://yasiv.com/youtube/)

## Webcams
- [SeeAllTheThings](https://github.com/baywolf88/seeallthethings)
- [Insecam](https://insecam.org/)
- [EarthCam](https://www.earthcam.com/)

## Documents

### Search

#### Common GoogleDorks
- [GoogleDocs (D)](https://www.google.com/?q=site:docs.google.com+%3Csearchterm%3E)
- [GoogleDrive (D)](https://www.google.com/?q=site:drive.google.com+%3Csearchterm%3E)
- [Dropbox (D)](https://www.google.com/?q=site:dl.dropbox.com+%3Csearchterm%3E)
- [Amazon AWS (D)](https://www.google.com/search?q=site:s3.amazonaws.com+%3Csearchterm%3E)
- [OneDrive (D)](https://www.google.com/search?safe=off&q=site:onedrive.live.com+%3Csearchterm%3E)
- [Cryptome (D)](https://www.google.com/search?q=site:cryptome.org+%3Csearchterm%3E)
- [Scribd](https://www.scribd.com/)
- [WikiLeaks Search](https://search.wikileaks.org/advanced)
- [RECAP Court Doc Repo](https://archive.recapthelaw.org/)
- [filessoo.com](https://filessoo.com/)
- [Leaked Cables](https://search.wikileaks.org/plusd/)

### Paste Sites
- [Pastebin OSINT Harvester (T)](https://github.com/needmorecowbell/sniff-paste)

## Fonts
- [What The Font](https://www.myfonts.com/pages/whatthefont)
- [Font Squirrel](https://www.fontsquirrel.com/matcherator)
- [IdentiFont](https://www.identifont.com/index.html)
- [What Font Is](https://www.whatfontis.com/) (M)
  AI-powered font identification tool that analyzes images against a database of 1.2M+ typefaces to identify fonts.
  _pricing: freemium; best for: Identifying fonts from screenshots and images_

# Social Networks

## Facebook

### Search
- [FB Email Search](https://www.facebook.com/public?query=email@gmail.com&nomc=0) (M)
  Facebook public search pattern used to test whether an email identifier resolves to matching profiles. Useful for quick account existence checks with manually edited query values.
  _best for: Quick Facebook account existence checks from an email identifier_
- [Recover FB Account](https://www.facebook.com/login/identify?ctx=recover)
  Facebook account recovery endpoint that confirms whether an email or phone number is linked to an account and presents recovery options.
  _best for: Validating whether a target email or phone is tied to a Facebook account_
- [Facebook Photos by ID (M)](https://www.facebook.com/photo.php?fbid=PHOTO-ID-HERE) (M)
  Direct Facebook photo permalink format that retrieves a specific image when the photo ID is known.
  _best for: Opening specific Facebook photos from known numeric IDs_
- [FB Lookup ID](https://lookup-id.com/)
  Web utility that resolves Facebook profile, page, or group URLs into numeric Facebook IDs for downstream investigation tools.
  _best for: Converting Facebook profile URLs into numeric IDs for pivoting_
- [FB Identify (Requires Logout)](https://www.facebook.com/login/identify)
  Facebook identify endpoint used in recovery workflows to resolve account records from submitted identifiers; typically works best when not logged in.
  _best for: Account discovery checks through Facebook identify flow_

## Fediverse/Mastodon
- [Fedifinder](https://fedifinder.glitch.me/) (R) *(deprecated)*
  Web tool that scanned Twitter profiles to find Fediverse/Mastodon handles among your contacts and exported them as CSV. The hosted instance now returns HTTP 410 and is no longer functional due to Twitter API restrictions.
  _best for: Finding Twitter contacts who moved to Mastodon/Fediverse_
- [Fediverse Observer](https://fediverse.observer/)
  Real-time dashboard tracking Fediverse instances across Mastodon, Pleroma, Misskey, PeerTube, and other ActivityPub platforms with server statistics and geographic mapping.
  _best for: Discovering and mapping Fediverse instances by software, country, or size_
- [Fediverse_OSINT (T)](https://github.com/cyfinoid/fediverse_osint) (T)
  Python CLI tool for checking whether a domain belongs to the Fediverse and hunting usernames across discoverable Fediverse servers.
  _best for: Cross-instance Fediverse user and content search_
- [Masto (T)](https://github.com/C3n7ral051nt4g3ncy/Masto) (T)
  Python-based Mastodon OSINT tool for investigating user accounts across instances. Retrieves profile details, toots, followers, and account metadata.
  _best for: Mastodon user profile investigation and account analysis_

## Instagram
- [Inflact Instagram Viewer (Anonymous)](https://inflact.com/instagram-viewer/profile/)
  Anonymous Instagram viewer for browsing public profiles, stories, and posts without authenticating to Instagram directly.
  _pricing: freemium; best for: Anonymous reconnaissance of public Instagram profiles_
- [Osintgram (T)](https://github.com/Datalux/Osintgram) (T, R)
  Python-based Instagram OSINT toolkit for extracting data from public accounts, including posts, hashtags, and follower relationships.
  _best for: Deep Instagram profile analysis from a local CLI workflow_

## Twitter

### Search
- [Twitter Advanced Search](https://twitter.com/search-advanced) (M)
  Built-in X/Twitter advanced search interface supporting operator-based filtering for users, terms, dates, and engagement constraints.
  _best for: Targeted discovery of public tweets with complex filters_
- [Twitter Location Search](https://twitter.com/search?q=geocode%3A36.1143855%2C-115.1727518%2C1km&src=typd) (M)
  Operator-based X/Twitter search workflow for geotagged content using `geocode:` and location-focused query parameters.
  _best for: Finding public tweets associated with specific coordinates and radius_
- [Twitter Date Search](https://twitter.com/search?q=SearchTerm%20since:2016-03-01%20until:2016-03-02) (M)
  Date-bounded X/Twitter search pattern using `since:` and `until:` operators to isolate tweets in a specific time window.
  _best for: Timeline reconstruction and historical tweet collection_
- [Followerwonk (R)](https://followerwonk.com/) (R)
  Follower analytics platform (now under Fedica) for examining X/Twitter audience demographics, account overlaps, and engagement trends.
  _pricing: freemium; best for: Audience demographic analysis and account overlap discovery_
- [Twopcharts](https://twopcharts.com/)
  Legacy Twitter statistics site for ranking active users by geography and language; coverage appears limited and stale.
  _best for: Legacy exploratory checks of historical Twitter influence rankings_
- [TweeterID](https://tweeterid.com/)
  Bidirectional converter between X/Twitter usernames and numeric account IDs for correlation and API-ready pivots.
  _best for: Converting Twitter handles to numeric IDs (and reverse)_

### Analytics

#### Profile
- [Tweepsect](https://tweepsect.com/) *(deprecated)*
  Former Twitter overlap analysis tool for intersecting followers and following lists between accounts; no longer operational under current API limits.
  _best for: Historical reference for follower overlap analysis workflows_
- [Twitonomy](https://www.twitonomy.com/) (R)
  Twitter analytics platform for profile activity, hashtag usage, and follower/following behavior over time.
  _best for: Profile-level Twitter analytics and behavior baselining_
- [Foller.me Analytics](https://foller.me/)
  Web analytics tool for summarizing public Twitter profile behavior, including hashtags, mentions, topics, and activity cadence.
  _best for: Quick baseline profiling of a Twitter account_
- [X0rz Tweets_analyzer (T)](https://github.com/x0rz/tweets_analyzer) (T, R)
  Python CLI analyzer for profiling Twitter user behavior, including posting rhythm, language distribution, and source-client usage.
  _best for: Behavioral profiling and temporal analysis of Twitter accounts_

#### Hashtag
- [RiteTag](https://ritetag.com/) (R)
  Hashtag intelligence platform that scores and recommends social tags based on trend velocity and engagement potential.
  _pricing: freemium; best for: Hashtag trend analysis and campaign tag selection_
- [TAGSExplorer](https://tags.hawksey.info/tagsexplorer/)
  Browser-based visualization layer for TAGS archives that maps mentions, replies, and retweet relationships from collected Twitter datasets.
  _best for: Conversation network mapping from archived Twitter data_
- [Tweet Metadata](https://www.wsj.com/public/resources/documents/TweetMetadata.pdf)
  Reference document and workflow aid for interpreting metadata fields embedded in tweet payloads and exports.
  _best for: Understanding tweet metadata fields for forensic analysis_
- [Birdwatcher (T)](https://github.com/michenriksen/birdwatcher) (T, R)
  Open-source Twitter data harvesting and analysis framework for collecting tweets and producing offline analytical artifacts.
  _best for: Local collection and analysis of Twitter datasets at scale_
- [Tinfoleak Web](https://tinfoleak.com/) (R)
  Web-based platform for Twitter/X intelligence analysis, user profiling, and geolocation-oriented review of public activity.
  _pricing: freemium; best for: Twitter profile and timeline intelligence_
- [Tinfoleak.py (T)](https://github.com/vaguileradiaz/tinfoleak) (T)
  Python command-line tool for collecting Twitter/X account intelligence and metadata from target profiles.
  _best for: CLI-based Twitter metadata collection_
- [DMI-TCAT (T)](https://github.com/digitalmethodsinitiative/dmi-tcat) (T, R)
  Twitter Capture and Analysis Toolset for collecting and analyzing Twitter datasets using self-hosted infrastructure.
  _best for: Large-scale Twitter collection and analysis_
- [Twint (T)](https://github.com/twintproject/twint) (T) *(deprecated)*
  Open-source Twitter scraping utility for collecting public tweet and user data without official API usage.
  _best for: Historical Twitter scraping without API keys_

### Location / Mapping
- [GeoSocial Footprint](https://geosocialfootprint.com/) (R)
  Geolocation-focused social media analysis service for mapping public location traces and movement patterns.
  _pricing: freemium; best for: Location and movement pattern analysis_
- [One Million Tweet Map](https://onemilliontweetmap.com/)
  Interactive map for viewing recent geolocated tweets and filtering by keyword and region.
  _best for: Real-time geolocated tweet monitoring_
- [Creepy (T)](https://github.com/ilektrojohn/creepy) (T) *(deprecated)*
  Desktop geolocation intelligence tool aggregating public geotagged data from supported social sources.
  _best for: Cross-platform geolocation aggregation_
- [Fedica](https://fedica.com/) (R)
  Social analytics platform with audience and engagement insights across multiple social networks.
  _pricing: freemium; best for: Cross-platform social analytics and tracking_

### Archive / Deleted Tweets
- [All My Tweets](https://www.allmytweets.net/)
  Twitter/X account history viewer for reviewing public tweet timelines in a single interface.
  _best for: Quick review of tweet history_
- [Spoonbill](https://spoonbill.io/) (R)
  Service that tracks Twitter/X profile changes such as bios, names, and avatars over time.
  _pricing: freemium; best for: Monitoring profile change history_
- [TweetVacuum (T)](https://github.com/UberKitten/TweetVacuum) (T, R)
  Tool for extracting larger Twitter/X timeline archives beyond default on-platform browsing constraints.
  _best for: Expanded tweet history export_

## Reddit
- [Reddit Metis](https://redditmetis.com/)
  Reddit user analyzer summarizing posting behavior, language patterns, and subreddit activity.
  _best for: Reddit user behavior profiling_
- [Reddit Archive](https://www.redditarchive.com/) *(deprecated)*
  Archive-oriented Reddit lookup resource for historical post and comment discovery workflows.
  _best for: Historical Reddit content lookup_
- [subreddits](https://subreddits.org/)
  Subreddit discovery index for identifying communities by topic and interest area.
  _best for: Topic-based subreddit discovery_
- [Reddit Comment History](https://roadtolarissa.com/javascript/reddit-comment-visualizer/)
  Visualization utility for reviewing Reddit account comment history and timing patterns.
  _best for: Comment activity timeline analysis_

## LinkedIn
- [LinkedInt - LinkedIn Recon Tool (T)](https://github.com/vysecurity/LinkedInt) (T, R) *(deprecated)*
  LinkedIn reconnaissance script for enumerating employee profiles and organization-linked data points.
  _best for: LinkedIn employee enumeration_
- [ScrapedIn (T)](https://github.com/dchrastil/ScrapedIn) (T, R)
  Open-source LinkedIn scraping utility for extracting profile and contact-style data from search results.
  _best for: LinkedIn profile data extraction_
- [InSpy (T)](https://github.com/jobroche/InSpy) (T, R)
  LinkedIn-focused reconnaissance tool that combines profile discovery with email pattern generation.
  _best for: Employee and email pattern discovery_
- [raven (T)](https://github.com/0x09AL/raven) (T, R)
  LinkedIn information gathering utility for automated employee enumeration and role filtering.
  _best for: Automated LinkedIn org mapping_

## TikTok
- [TikTok (M)](https://www.tiktok.com/@username) (M)
  Manual TikTok profile URL pattern for direct lookup of public account pages.
  _best for: Fast manual TikTok profile checks_
- [TikTok-OSINT (T)](https://github.com/Omicron166/TikTok-OSINT) (T)
  Python tool for extracting TikTok profile metadata and video-linked OSINT artifacts.
  _best for: Automated TikTok metadata collection_
- [Unfurl](https://github.com/obsidianforensics/unfurl) (T)
  Forensic parser that extracts and visualizes metadata components embedded in URLs.
  _best for: URL parameter and metadata forensics_
- [yt-dlp (T)](https://github.com/yt-dlp/yt-dlp) (T)
  Actively maintained command-line downloader for collecting video content and metadata from many platforms.
  _best for: Video evidence preservation and metadata export_

## Bluesky
- [Treeverse (T)](https://treeverse.app/)
  Thread visualization tool for exploring conversation trees on supported social platforms.
  _best for: Conversation structure mapping_

## Threads
- [Bellingcat Meta Content Library](https://bellingcat.gitbook.io/toolkit/more/all-tools/meta-content-library) (R)
  Guide to Meta Content Library access for researching public Facebook, Instagram, and Threads content.
  _best for: Meta platform archive research for eligible organizations_
- [Threads Dashboard](https://www.threadsdashboard.com/) (R)
  Analytics and insights platform for Threads accounts using the official API. Tracks audience demographics, engagement metrics, and historical posting data.
  _pricing: freemium; best for: Threads account analytics and engagement investigation_
- [Threads-Scraper (T)](https://github.com/Zeeshanahmad4/Threads-Scraper) (T)
  Python browser automation tool that scrapes public Threads posts and profiles without authentication, outputting structured data in JSON, CSV, or XML. Last updated July 2023.
  _best for: Bulk extraction of Threads posts for offline analysis_
- [ThreadsRecon (T)](https://github.com/offseq/threadsrecon) (T)
  Python OSINT tool for Threads profile analysis including sentiment analysis, network visualization, and automated PDF reporting.
  _best for: Threads profile investigation with sentiment and network analysis_

## Steam, Discord & Gaming Networks
- [SteamOSINT (T)](https://github.com/Frontline-Femmes/Steam-OSINT) (T)
  Python tool for OSINT on Steam user profiles. Collects public profile data including games owned, achievements, playtime, and trade history.
  _best for: Steam account investigation and user profile analysis_

## Other Social Networks
- [Ask FM](https://ask.fm/%3Cusername%3E) (M)
  Q&A social network where users answer anonymous and public questions. Supports direct profile lookup via URL manipulation.
  _best for: Finding Ask FM profiles by username_
- [Myspace](https://myspace.com/)
  Legacy social network originally used for profile sharing. Still operational with archived data, music discovery, and profile search capabilities.
  _best for: Searching for archived Myspace profiles and historical social media data_
- [Tumblr](https://www.tumblr.com/tagged/search)
  Blogging and social network platform with tagging system. Supports keyword and tag-based content search.
  _best for: Finding content and user profiles by tag or keyword across Tumblr_
- [BlackPlanet.com - Member Find](https://www.blackplanet.com/user_search/index.html)
  Dedicated member search tool for BlackPlanet, a social network primarily serving the African-American community. Supports direct user lookup.
  _best for: Finding BlackPlanet user profiles by username or criteria_
- [MiGente (Latino)](https://migente.com/wp-login.php?redirect_to=https%3A%2F%2Fmigente.com%2Fuser_search%2Findex.html&bp-auth=1&action=bpnoaccess) (R)
  Legacy social network for Latino communities with archived profiles. May require login or have limited accessibility.
  _best for: Searching archived MiGente profiles_
- [Asian Avenue](https://blackplanet.com/) *(deprecated)*
  Former social network for Asian communities, now redirects to BlackPlanet. Archived historical data may still be searchable.
  _best for: Searching archived Asian Avenue profile data_
- [Orkut (Brazil)](https://orkut.google.com/) *(deprecated)*
  Former Google social network that shut down in September 2014. URL now returns error. Historical archives may exist on the Wayback Machine.
  _best for: Accessing archived Orkut profiles via Wayback Machine_
- [Odnoklassniki](https://ok.ru/)
  Russian social network with millions of users. Supports direct user search by username and profile lookup.
  _best for: Finding Russian-speaking users and investigating Odnoklassniki profiles_
- [VK](https://vk.com/)
  Largest Russian-language social network with features similar to Facebook. Supports user search and direct profile access.
  _best for: Finding Russian and Eastern European users and profile investigation_
- [Delicious](https://del.icio.us/)
  Social bookmarking platform where users share and discover web links with tags. Supports user profile and bookmark search.
  _best for: Finding user bookmarking profiles and discovering curated link collections_
- [TheHoodUp (NSFW)](https://thehoodup.com/board/)
  Urban community forum and message board with discussion threads, media sharing, and user profiles. Contains NSFW content.
  _best for: Searching forum posts, user profiles, and discussions on TheHoodUp community board_
- [Share Secret Feedback (M)](https://secreto.site/en/%3Cuser_id%3E) (M)
  Anonymous feedback and messaging platform where users collect candid messages from friends and coworkers. Supports 30+ languages and integrates with WhatsApp, Instagram, Snapchat, and Twitter.
  _best for: Looking up Secreto profiles by username to find anonymous feedback pages_

## Search
- [Social Searcher](https://www.social-searcher.com/)
  Multi-platform social media search engine aggregating content from Twitter, Facebook, Instagram, Tumblr, and other networks. Supports real-time and historical search.
  _pricing: freemium; best for: Cross-platform social media content search_
- [Google Social Search](https://www.social-searcher.com/google-social-search/) (D)
  Google-powered social media search using advanced operators. Provided through Social Searcher's integration.
  _best for: Advanced social media search using Google operators_
- [Talkwalker Social Media Search (R)](https://www.talkwalker.com/social-media-analytics-search) (R)
  Enterprise social media monitoring and search platform. Tracks mentions across social networks, forums, and news sources with sentiment analysis.
  _pricing: freemium; best for: Enterprise-grade social media monitoring and trend analysis_
- [PinGroupie](https://pingroupie.com/)
  Pinterest group analysis and discovery tool. Tracks Pinterest user statistics, board content, and group discussions.
  _best for: Pinterest user and board analysis_

# Instant Messaging

## Chat Archive Analysis
- [Comms Analyzer Toolbox (T)](https://github.com/bitsofinfo/comms-analyzer-toolbox) (T)
  Open-source toolkit for forensic analysis of communication archives with Elasticsearch/Kibana dashboards for message timelines and pattern analysis.
  _best for: Email/SMS chat archive forensics and timeline analysis_

## Discord
- [Disboard](https://disboard.org/)
  Public Discord server discovery platform used to find communities by topic, language, and popularity.
  _best for: Discovering public Discord communities and server metadata_
- [DiscordOSINT (T)](https://github.com/husseinmuhaisen/DiscordOSINT)
  GitHub repository of Discord investigation techniques, queries, and tooling references for OSINT workflows.
  _best for: Learning Discord investigation methods and toolchains_

## Resources
- [Awesome OSINT](https://github.com/jivoi/awesome-osint)
  Large curated OSINT resource list covering investigation tools, techniques, and training references.
  _best for: Broad OSINT tool discovery and methodology reference_

## Signal / Phone Lookup
- [OSINT Industries](https://www.osint.industries/) (R)
  Commercial OSINT investigation platform focused on account attribution and cross-platform identity correlation.
  _pricing: paid; best for: Enterprise-grade identity enrichment and account correlation_

## Slack
- [SlackPirate (T)](https://github.com/emtunc/SlackPirate) (T, R)
  Security testing tool for Slack workspaces that enumerates channels and extracts accessible messages/files from authenticated sessions.
  _best for: Slack workspace enumeration and sensitive data exposure assessment_
- [slack-intelbot (T)](https://github.com/pun1sh3r/slack-intelbot) (T, R)
  Slack bot that enriches indicators such as domains, IPs, and hashes by querying external threat intelligence services.
  _best for: In-channel IOC enrichment for threat intelligence triage_
- [slack-web-scraper (T)](https://github.com/iulspop/slack-web-scraper) (T, R)
  Automation script for collecting Slack channel history and metadata from accessible workspaces.
  _best for: Archiving Slack channel content for offline analysis_

## Telegram
- [Google CSE for Telegram links](https://cse.google.com/cse?cx=006368593537057042503:efxu7xprihg) (M)
  Preconfigured Google Custom Search Engine focused on public Telegram links and channel discovery.
  _best for: Finding public Telegram channels and groups by keyword_
- [Telegago (T)](https://tools.osintnewsletter.com/osint-tools/telegago-telegram)
  Telegram-focused search interface built on Google CSE to discover public channels, groups, and related pages.
  _best for: Keyword discovery across publicly indexed Telegram content_
- [Telegram-OSINT (T)](https://github.com/The-Osint-Toolbox/Telegram-OSINT)
  Curated Telegram OSINT repository linking tools, techniques, and investigative references.
  _best for: Sourcing Telegram-specific tooling and investigative playbooks_
- [TGStat](https://tgstat.com/) (R)
  Telegram analytics platform indexing public channels and chats with growth, engagement, and content metrics.
  _pricing: freemium; best for: Telegram channel trend analysis and engagement benchmarking_
- [Tosint (T)](https://github.com/drego85/tosint) (T)
  Telegram OSINT script for profiling bots, extracting public metadata, and correlating related infrastructure clues.
  _best for: Telegram bot reconnaissance and metadata extraction_

## WeChat / LINE
- [Sogou WeChat Search](https://weixin.sogou.com/)
  Chinese search portal indexing publicly accessible WeChat articles and official account content.
  _best for: Discovering public WeChat posts and organization presence_
- [WechatSogou (T)](https://github.com/Chowency/WechatSogou) (T)
  Python package for automating Sogou WeChat searches and parsing returned article/account results.
  _best for: Automating batch WeChat article and account discovery_
- [wechat-dump (T)](https://github.com/ppwwyyxx/wechat-dump) (T)
  Tool for exporting WeChat chat data from rooted Android devices for forensic examination and recovery.
  _best for: Authorized mobile WeChat chat history extraction and preservation_
- [wechat-text-backup (T)](https://github.com/zhaofeng-shu33/wechat-text-backup) (T)
  WeChat database decryption and backup utility for exporting local message history into readable text formats.
  _best for: Decrypting and backing up local WeChat message archives_
- [linelog2py (T)](https://github.com/jyu0414/linelog2py) (T)
  Python parser for processing exported LINE chat logs into structured records for analysis.
  _best for: Converting LINE chat exports for downstream analysis workflows_
- [line-message-analyzer (T)](https://github.com/chonyy/line-message-analyzer) (T)
  Local analysis utility for LINE chat exports that computes message statistics and conversational activity patterns.
  _best for: LINE conversation frequency and behavior analysis_

## WhatsApp
- [Email2WhatsApp (T)](https://github.com/dsonbaker/email2whatsapp) (T)
  OSINT utility for correlating email addresses to potential WhatsApp identifiers and account traces.
  _best for: Email-to-WhatsApp account correlation during profiling_
- [WhatsApp-OSINT (T)](https://github.com/kinghacker0/WhatsApp-OSINT) (T, R)
  WhatsApp reconnaissance toolchain using API-backed lookups for account and device-related intelligence collection.
  _pricing: freemium; best for: Rapid WhatsApp account reconnaissance and metadata checks_

# People Search Engines

## General People Search
- [InfoFlow Public People Search In Chilean](https://infoflow.cloud/) (R)
  Chilean public records lookup service for vehicle registrations, personal ID numbers (RUN), company information, and reverse name-to-RUN lookups via web portal, WhatsApp, or Telegram.
  _pricing: freemium; best for: Chilean public records and identity verification_
- [ThatsThem](https://thatsthem.com/name-address-search)
  Free people search engine with 2.2 billion indexed names. Provides reverse phone, email, address, and IP lookups alongside standard name searches.
  _pricing: freemium; best for: Quick free people lookups by name, address, phone, email, or IP_
- [Melissa Data - People Finder (R)](https://www.melissa.com/) (R)
  Enterprise data quality and identity verification platform offering people search, address verification, phone append, and email verification across global datasets.
  _pricing: paid; best for: Enterprise-grade identity verification and data enrichment_
- [PeekYou](https://www.peekyou.com/)
  Free people search engine indexing over 300 million profiles. Aggregates social media accounts, public records, and web presence into unified profiles.
  _best for: Finding social media profiles and web presence by name_
- [Webmii](https://webmii.com/)
  Free people search engine that calculates a web visibility score based on online presence across social networks, news, and web pages.
  _best for: Assessing online visibility and web footprint_
- [Snitch.name](https://snitch.name/)
  People profile search engine checking approximately 40 social networks including Facebook, Twitter, LinkedIn, Xing, and government databases.
  _best for: Cross-platform social media profile discovery_
- [Lullar](https://com.lullar.com/)
  Free people search tool that checks 148+ social media platforms for matching profiles by email or username. No sign-up or payment required.
  _best for: Username and email-based social media profile enumeration_
- [Yasni](https://www.yasni.com/)
  Free people search engine allowing searches by name, location, profession, company, or skills. Also offers professional Expose profile pages.
  _best for: Name-based people search with professional context_
- [findmypast.com](https://www.findmypast.com/discover) (R)
  UK-focused genealogy and historical records platform with billions of records covering census, birth, marriage, death, military, and immigration documents.
  _pricing: paid; best for: UK and Irish genealogy and historical records research_
- [IDCrawl](https://www.idcrawl.com/)
  Free people search aggregator that finds social media profiles, photos, and public records across major platforms including Instagram, Facebook, and LinkedIn.
  _best for: Aggregated people search across social media and public records_
- [FamilySearch.org](https://familysearch.org/search/)
  Free genealogy platform operated by The Church of Jesus Christ of Latter-day Saints with billions of historical records, family trees, and digitized documents worldwide.
  _best for: Free genealogy research and historical record access_
- [Ancestry.com](https://www.ancestry.com/search/)
  World's largest genealogy platform with over 40 billion historical records including census, immigration, military, and vital records across 80+ countries.
  _pricing: freemium; best for: Comprehensive genealogy and family history research_
- [AnyWho](https://www.anywho.com/whitepages)
  Free white pages directory providing people search by name, reverse phone lookup, and address lookup for US-based contacts.
  _best for: US white pages people and phone lookups_
- [Addresses.com](https://www.addresses.com/)
  Free people search engine for name, phone, and address lookups. Basic results are free; detailed reports redirect to Intelius (paid).
  _pricing: freemium; best for: Quick US people and address lookups_
- [FaceCheckID](https://facecheck.id/)
  Reverse image face search engine that matches uploaded photos against social media, news, and mugshot databases to identify individuals.
  _pricing: freemium; best for: Reverse face image search and identity verification_
- [usa-people-search.com](https://www.usa-people-search.com/) (R)
  US people search and background check service accessing public records. Reports are paid with significant consumer complaints about billing.
  _pricing: paid; best for: US background checks and people search via public records_

## Registries
- [The Knot](https://www.theknot.com/registry/couplesearch)
  Wedding registry search allowing lookup of couples' wedding registries by name. Part of The Knot comprehensive wedding planning platform.
  _best for: Finding wedding registries by couple name_
- [Registry Finder](https://registryfinder.com:443/)
  Gift registry search aggregator searching across partner retailers including Amazon, Target, and Zola for wedding, baby, birthday, and other registries.
  _best for: Cross-retailer gift registry search_
- [My Registry](https://www.myregistry.com/)
  Universal gift registry platform allowing users to add gifts from any store worldwide into one shareable registry for weddings, babies, and other occasions.
  _best for: Universal cross-store gift registry creation and search_
- [Amazon Registry Search](https://www.amazon.com/registries) (M)
  Amazon gift registry search for wedding, baby, and other registries.
  _best for: Finding Amazon gift registries by name_
- [The Bump](https://registry.thebump.com/babyregistrysearch)
  Baby registry finder from The Bump parenting platform. Search for baby registries by name to find gift lists.
  _best for: Finding baby registries by parent name_

# Dating
- [AYI.com](https://www.ayichat.com) (R)
  Online community for real-time meeting and chatting with singles across web and mobile platforms.
  _pricing: freemium; best for: Real-time flirting and location-based casual dating_
- [Plenty Of Fish.com](https://www.pof.com/) (R)
  Freemium dating platform with large membership and profile-based discovery through filters and recommendations.
  _pricing: freemium; best for: Casual dating and broad free profile discovery_
- [eHarmony](https://www.eharmony.com/) (R)
  Personality-based matchmaking platform focused on long-term relationships with curated compatibility-driven pairings.
  _pricing: paid; best for: Compatibility-matched dating for long-term relationships_
- [Farmers Only](https://www.farmersonly.com/) (R)
  Niche dating service for rural communities including farmers and ranchers with lifestyle-focused matching.
  _pricing: freemium; best for: Rural lifestyle dating and niche community matching_
- [Tinder (R)](https://tinder.com/) (R)
  Swipe-based dating platform emphasizing quick location-aware matching and in-app messaging.
  _pricing: freemium; best for: High-volume casual matching and rapid local discovery_
- [Bumble (R)](https://bumble.com/) (R)
  Swipe-based dating app with women-first messaging rules and location-based recommendations.
  _pricing: freemium; best for: Women-initiated conversations and location-based dating_
- [Tantan (R)](https://int.tantanapp.com) (R)
  Swipe-based Asian-focused dating app with geolocation and algorithmic profile recommendations.
  _pricing: freemium; best for: Asia-focused dating and geolocation-based matching_
- [AdultFriendFinder](https://www.adultfriendfinder.com) (R)
  Adult-oriented social and dating platform with searchable profiles and preference-driven discovery.
  _pricing: freemium; best for: Adult dating, explicit preference filtering, and username-based discovery_
- [BeautifulPeople.com](https://www.beautifulpeople.com/en-US) (R)
  Dating community with verification-oriented onboarding and profile access tied to membership standards.
  _pricing: freemium; best for: Identity-verified social discovery and premium dating communities_
- [Badoo](https://badoo.com) (R)
  Global social dating platform with swipe-based matching, nearby discovery, and in-app messaging.
  _pricing: freemium; best for: Global-scale casual dating and people-nearby discovery_
- [Spark.com](https://spark.com) (R)
  Long-running relationship-focused dating service with profile filtering and compatibility-oriented matching tools.
  _pricing: freemium; best for: Relationship-seeking users and compatibility-based matching_
- [Meetup](https://www.meetup.com/) (R)
  Community event platform for discovering local groups and activities that can support social and relationship networking.
  _best for: Interest-based in-person social discovery through events and groups_
- [Hinge](https://hinge.co/en-gb) (R)
  Relationship-oriented dating app focused on prompt-driven profiles and conversation-first matching.
  _pricing: freemium; best for: Intentional relationship-focused matching with richer profile context_

# Telephone Numbers

## Voicemail
- [Slydial](https://www.slydial.com/) (R)
  Voicemail drop service that connects directly to a recipient voicemail box without ringing the handset.
  _pricing: freemium; best for: Voicemail-based phone-number engagement checks_

## International
- [Numbering Plans](https://www.numberingplans.com/?page=analysis&sub=phonenr)
  International numbering reference for E.164 plans, carrier codes, and dialing metadata.
  _best for: Telephony standards and numbering-plan validation_
- [Numberway](https://www.numberway.com/)
  Reverse phone lookup resource used to resolve ownership and location context from a phone number.
  _pricing: freemium; best for: Reverse phone owner and location enrichment_
- [WhoCalld](https://whocalld.com/) (R) *(deprecated)*
  Legacy reverse-caller-ID listing retained for historical continuity in this category.
  _pricing: freemium; best for: Historical reference only (defunct per project guidance)_
- [CallerID Test](https://calleridtest.com/)
  Caller ID and number-validation utility for checking formatting and telecom metadata responses.
  _pricing: freemium; best for: Caller-ID behavior and number validity testing_
- [Twilio Lookup](https://www.twilio.com/lookup) (R)
  Twilio API endpoint for phone intelligence including line type, carrier, and validation data.
  _pricing: paid; best for: Programmatic carrier/type validation and fraud controls_
- [Fone Finder](https://www.fonefinder.net/) (R) *(deprecated)*
  Legacy reverse phone lookup entry preserved for historical coverage in the framework.
  _pricing: freemium; best for: Historical reference only (defunct per project guidance)_
- [True Caller](https://www.truecaller.com/) (R)
  Caller identification platform and mobile app for reverse lookup and spam-call context.
  _pricing: freemium; best for: Caller-ID enrichment and spam reputation checks_
- [Reverse Genie](https://www.reversegenie.com/phone.php)
  Reverse phone lookup service that returns publicly aggregated ownership and location hints.
  _best for: Quick reverse-number triage from public-data aggregations_
- [SpyDialer](https://www.spydialer.com:443/default.aspx) (R)
  Reverse phone lookup platform with caller intelligence and voicemail-related lookup features.
  _pricing: freemium; best for: Phone-number attribution and spam context pivoting_
- [Phone Validator](https://www.phonevalidator.com/index.aspx)
  Number-validation utility focused on format, line-type, and carrier checks.
  _best for: Phone format/type validation before deeper pivots_
- [Phonerator](https://www.martinvigo.com/phonerator/)
  Phone number generation and testing utility for telephony research workflows.
  _best for: Generating test-number patterns for scripting and analysis_
- [Mr. Number (M)](https://www.hiya.com/products/apps/hiya-spam-blocker) (R, M) *(deprecated)*
  Mr. Number functionality has been consolidated under Hiya; retained as a legacy reference entry.
  _pricing: paid; best for: Historical mapping to Hiya for caller-ID workflows_
- [Next Caller (R)](https://nextcaller.com/) (R)
  Caller-identification and spam intelligence service for reverse lookup workflows.
  _pricing: paid; best for: Commercial caller-ID enrichment and number intelligence_
- [Data24-7 (R)](https://www.data24-7.com/signup.php) (R)
  Commercial data enrichment provider supporting phone-based identity and risk intelligence lookups.
  _pricing: paid; best for: Enterprise-scale person/contact enrichment from phone pivots_
- [HLR Lookup Portal (R)](https://www.hlr-lookups.com/en/start) (R)
  HLR lookup service for telecom reachability, network, and carrier status checks.
  _pricing: paid; best for: Mobile carrier/HLR validation and route intelligence_
- [OpenCNAM API](https://api.opencnam.com/v2/phone/+19073372323) (R)
  CNAM lookup API for resolving caller-name metadata from North American numbers.
  _pricing: paid; best for: Programmatic caller-name enrichment in telecom workflows_
- Numspy (T) (unrecognized node type: python3 Module)
- [Numspy-Api](https://numspy.pythonanywhere.com/) (R)
  API wrapper for Numspy-style phone intelligence queries and automation use cases.
  _pricing: freemium; best for: Programmatic phone-number verification and enrichment_
- [Family Tree Now (M)](https://www.familytreenow.com/search/genealogy/results?phoneno=(555)555-5555) (M)
  People-search aggregator that can pivot from phone numbers to identity and relationship records.
  _pricing: freemium; best for: Phone-to-person and household/relative pivoting_
- [Whitepages Reverse Phone](https://www.whitepages.com/reverse-phone)
  Reverse phone lookup product from Whitepages for US-focused identity and contact attribution.
  _pricing: freemium; best for: US reverse-phone attribution and address correlation_
- [Hiya (R$)](https://www.hiya.com/) (R)
  Caller-ID and spam-protection platform with reverse lookup capabilities and mobile integrations.
  _pricing: freemium; best for: Spam classification and caller-ID enrichment on mobile workflows_

# Public Records

## Property Records
- [Melissa Data - Property Viewer (R)](https://melissa-data.com) (R)
  Commercial property lookup and real estate information provider with verified tax assessor data. Requires registration and payment for detailed property records.
  _pricing: paid; best for: Property ownership verification_
- [Regrid (US Only)](https://regrid.com)
  Interactive property mapping and parcel data tool covering most US counties. Provides parcel boundaries, assessment data, and ownership information.
  _pricing: freemium; best for: Parcel mapping and property boundaries_
- [Emporis](https://www.emporis.com/) *(deprecated)*
  Buildings database and information portal. DEPRECATED - closed September 2022 by CoStar Group.
  _pricing: paid; best for: N/A - Service shutdown_
- [Neighbor Report](https://neighbor.report/)
  Neighborhood and property statistics including crime data, schools, and community information. Aggregates public data into neighborhood profiles.
  _best for: Neighborhood demographics and safety_
- [Redfin](https://redfin.com)
  Real estate marketplace with comprehensive property history, MLS data, and market analytics. Includes tax history and public records.
  _best for: Property history and market data_

## Court / Criminal Records
- [Nationwide County Court Records](https://www.publicrecordcenter.com/onlinecourtrecords.htm) (M)
  Directory and aggregator linking to county court record systems across the United States. Provides navigation to local court databases.
  _best for: Locating county court records_
- [World Legal Information Institute](https://worldlii.org)
  International legal database aggregating laws, regulations, and court decisions from 140+ countries. Free access to legal documents.
  _best for: International legal research_
- [Most Wanted Criminal Pages](https://www.fbi.gov/wanted/fugitives)
  FBI's official wanted fugitives database featuring the Ten Most Wanted list and expanded fugitive database with photos and details.
  _best for: Wanted fugitive identification_
- [Black Book Online - Criminal Search](https://www.blackbookonline.info/)
  Free public records search portal covering 37,000+ types of records including criminal records, court records, property records, and background checks.
  _best for: Broad public records aggregation_
- [CrimeReports.com](https://crimereports.com)
  Real-time crime reporting map aggregating incident data from law enforcement agencies. Interactive map with searchable crime statistics.
  _best for: Crime incident mapping_
- [Familywatchdog - Sex Offender Search](https://www.familywatchdog.us/)
  Free sex offender registry aggregator combining data from all US state registries. Interactive mapping of registered offenders.
  _best for: Sex offender registry search_
- [The Inmate Locator](https://www.bop.gov/inmateloc/)
  Federal Bureau of Prisons official inmate search tool. Covers federal inmates incarcerated from 1982 to present with daily updates.
  _best for: Federal inmate location_
- [National Sex Offender Search](https://www.nsopw.gov/)
  Official National Sex Offender Public Website aggregating state registry data. Comprehensive multi-state sex offender search tool.
  _best for: National sex offender search_
- [Mugshots.com](https://mugshots.com)
  Searchable mugshot database aggregating arrest records and booking photos from law enforcement agencies nationwide.
  _best for: Arrest record and mugshot lookup_
- [judyrecords](https://www.judyrecords.com/)
  Free nationwide court case search engine with 760M+ US court cases. Covers federal and state courts with 10x more cases than PACER.
  _best for: Nationwide court case search_
- [Caselaw Access Project](https://case.law/)
  Harvard-hosted comprehensive free legal database with 6M+ court opinions. Digitized legal decisions from centuries of US case law.
  _best for: Historical legal opinion research_
- [CourtListener](https://courtlistener.com/)
  Free legal research platform with millions of opinions, dockets, and RECAP data from US federal and appellate courts.
  _best for: Federal court opinion and docket search_
- [Docket Alarm](https://docketalarm.com)
  Federal and state litigation docket tracking and analysis. Free PACER alternative with real-time docket updates and case tracking.
  _pricing: freemium; best for: Litigation docket tracking_
- [Google Scholar Case Law](https://scholar.google.com/scholar_courts)
  Google's free legal research tool indexing millions of court opinions from US federal and state courts.
  _best for: Quick case law lookup_
- [PACER](https://pacer.uscourts.gov/) (R)
  Public Access to Court Electronic Records. Official US federal court records system with fee-based access to documents.
  _pricing: paid; best for: Official federal court documents_
- [Free Law RECAP Archive](https://www.courtlistener.com/recap/)
  Free archive of PACER documents crowdsourced by Free Law Project. Contains millions of federal court documents without per-page fees.
  _best for: Free federal court documents_
- [UniCourt](https://unicourt.com/)
  Free nationwide litigation database and docket analyzer. Aggregates state and federal court records with smart search and case tracking.
  _pricing: freemium; best for: Multi-state litigation search_
- [Federal Inmate Locator](https://www.bop.gov/inmateloc/)
  Bureau of Prisons official inmate search tool covering federal inmates 1982-present. Daily database updates with release dates.
  _best for: Federal inmate location and release dates_
- [Epstein Exposed](https://epsteinexposed.com/)
  Comprehensive searchable database of Epstein case documents including court records, flight logs, emails, and financial records.
  _best for: Epstein case document research_

## Government Records
- [NC Salary DB](https://www.ncosc.gov/public-information/state-employee-salary-database)
  Official North Carolina state employee salary database. Published by Office of State Controller for transparency.
  _best for: NC public employee salary lookup_
- [Gov Data Canada](https://open.canada.ca/data/en/dataset)
  Government of Canada Open Data Portal. Federal open data including demographics, business info, and statistics.
  _best for: Canadian federal public data_
- [CA Salary DB](https://transparentcalifornia.com/)
  Comprehensive California government salary database covering state, local, schools, universities, and special districts.
  _best for: California public employee salary lookup_

## Financial / Tax Resources
- [BIN Base](https://www.buybindatabase.binbase.com/)
  Business Identification Number database for company registration lookups. Provides business registration and compliance information.
  _pricing: freemium; best for: Business registration verification_
- [VAT Research](https://www.belastingdienst.nl/)
  Netherlands tax authorities (Belastingdienst) database. Allows VAT number verification through VIES system.
  _best for: Dutch VAT number verification_
- [NETR Online](https://publicrecords.netronline.com/) (M)
  Nationwide property records portal linking to county assessors and county recorders. Provides property tax, deed, and parcel data.
  _best for: County property records aggregation_

## Birth Records
- [Sorted by Birth Date](https://www.bop.gov/inmateloc/)
  Refers to inmate search filters available in state and federal inmate databases. Searchable by date of birth field.
  _best for: Inmate lookup by birth date_

## Death Records
- [Death Check](https://www.deathindexes.com/) (M)
  Directory of online death indexes, obituaries, and cemetery records. Aggregates links to state and national obituary databases.
  _best for: Death record and obituary lookup_
- [Find A Grave](https://www.findagrave.com/)
  Largest online cemetery database with 615M+ grave records from 250M+ graves in 500K+ cemeteries worldwide.
  _best for: Cemetery and burial record search_
- [GraveInfo](https://billiongraves.com/)
  Cemetery records database with GPS-marked grave locations and gravestone photos. Aggregates cemetery information with mobile crowdsourcing.
  _pricing: freemium; best for: GPS cemetery mapping_

## US County Data
- [NACo County Explorer](https://explorer.naco.org/)
  Interactive mapping tool with 1000+ demographic and economic indicators for all 3,069 US counties. National Association of Counties data portal.
  _best for: County-level demographic analysis_

## US Voter Records
- [Voter Registration Data](https://www.sos.secretary.state.gov/) (M)
  State-level voter registration databases. Varies significantly by state in coverage and access methods.
  _best for: Voter registration verification_

## Patent Records
- [US Patent Office Search](https://www.uspto.gov/patents/search)
  Official US Patent and Trademark Office searchable patent database. Covers US patents and applications.
  _best for: US patent search_
- [Google Patent Search](https://patents.google.com/)
  Google's searchable patent database covering US, EU, WIPO and other international patents. Full-text search with categorization.
  _best for: International patent research_

## US Political Records
- [Political MoneyLine](https://www.opensecrets.org/)
  Campaign finance and political money database aggregating federal election contributions and lobbying data.
  _best for: Campaign finance and lobbying tracking_
- [MelissaData - Campaign Contributions](https://melissa-data.com) (R)
  Commercial campaign contribution database with verified donor and contribution records. Requires subscription.
  _pricing: paid; best for: Verified campaign donation records_
- [Influence Explorer](https://influenceexplorer.com/)
  Campaign finance, lobbying, and political data aggregator. Part of OpenSecrets ecosystem with federal and state data.
  _best for: Political influence and money tracking_
- [US Federal Election Commission](https://fec.gov/data)
  Official Federal Election Commission data portal. Searchable federal campaign finance disclosures and election data.
  _best for: Federal campaign finance records_
- [Every Politician](https://everypolitician.org/)
  Open data project aggregating politician information globally. Structured data on politicians, positions, and affiliations.
  _best for: Global politician data and positions_
- [Public Records?](https://www.brbpublications.com/) (M)
  Ambiguous entry - likely refers to BRB Publications' public records portal or aggregator. See BRB Public Records below for clarification.
  _best for: Unclear - requires VP clarification_
- [The World Bank Open Data Catalog](https://datacatalog.worldbank.org/)
  World Bank open development data portal with datasets on economics, demographics, and global development indicators.
  _best for: Development data and statistics_
- [BRB Public Records](https://www.brbpublications.com/)
  BRB Publications portal linking to public records sources across US. Reference guide with 20K+ government agencies and vendors.
  _pricing: freemium; best for: Public records source directory_
- [GOVDATA - Das Datenportal für Deutschland (German)](https://www.govdata.de/)
  Official German government open data portal with 120K+ datasets. Centralized access to federal, state, and local administrative data.
  _best for: German administrative data_
- [Open-Data-Portal München (German)](https://opendata.muenchen.de/)
  City of Munich open data portal with 331+ datasets. Provides administrative data from Munich government at city level.
  _best for: Munich municipal administrative data_
- [Searchable FCC ID Database](https://www.fcc.gov/oet/ea/fccid)
  Official FCC database for electronic device certification. Searchable by FCC ID with product specs, manuals, and test reports.
  _best for: Electronics device certification lookup_

# Compliance & Risk Intelligence

## Sanctions Screening
- [OpenSanctions](https://www.opensanctions.org/)
  Aggregated database of sanctioned entities, politically exposed persons, and persons of criminal interest from 329 global data sources.
  _pricing: freemium; best for: Bulk sanctions and PEP screening across consolidated global watchlists_
- [OFAC Sanctions List Search](https://sanctionssearch.ofac.treas.gov/)
  Official U.S. Treasury tool for searching OFAC Specially Designated Nationals and related sanctions lists with approximate string matching.
  _best for: Checking individuals or entities against U.S. sanctions programs_
- [EU Sanctions Tool (D)](https://sanctions-tool.ec.europa.eu)
  European Commission tool for searching EU restrictive measures and consolidated sanctions lists targeting persons, entities, and bodies.
  _best for: Checking individuals or entities against EU sanctions regimes_
- [dilisense](https://dilisense.com/en) (R)
  AML compliance platform that screens individuals and entities against sanctions, PEP, and watchlist data sources with fuzzy matching and confidence scoring.
  _pricing: freemium; best for: Commercial AML/KYC sanctions screening and PEP checks_

## KYC / AML Tools
- [NameScan](https://namescan.io)
  Compliance screening platform providing sanctions checks, PEP screenings, and adverse media searches against global government databases with a free tier.
  _pricing: freemium; best for: Quick free sanctions and PEP screening with adverse media checks_
- [OpenScreening](https://resources.linkurious.com/openscreening)
  Free graph-based PEP and sanctions screening tool by Linkurious that visualizes connections across persons of interest using OpenSanctions and ICIJ data.
  _best for: Visualizing connections between sanctioned entities, PEPs, and offshore structures_
- [Companies House (R)](https://find-and-update.company-information.service.gov.uk/)
  Official UK government register for searching company information, officer appointments, and disqualified directors across all UK-registered companies.
  _best for: Looking up UK company details, officers, and filing history_

## Beneficial Ownership Lookup
- [OpenOwnership](https://www.openownership.org/en/)
  Global hub for beneficial ownership transparency, providing data standards and a register linking corporate ownership data across jurisdictions.
  _best for: Investigating beneficial ownership of corporate entities across jurisdictions_
- [ICIJ Offshore Leaks Database](https://offshoreleaks.icij.org/)
  Searchable database of 800,000+ offshore entities from ICIJ investigations including Panama Papers, Paradise Papers, and Pandora Papers.
  _best for: Tracing offshore company structures and hidden ownership from leaked documents_
- [OCCRP Aleph (R)](https://aleph.occrp.org/) (R)
  Global archive of research material for investigative reporting, aggregating public records, court filings, company registries, and leaks from 200+ sources.
  _best for: Cross-referencing persons and companies across public records, leaks, and investigative datasets_
- [Public Records?](https://publicrecords.searchsystems.net/)
- [The World Bank Open Data Catalog](https://datacatalog.worldbank.org/)
- [BRB Public Records](https://www.brbpub.com/)
- [GOVDATA - Das Datenportal für Deutschland (German)](https://www.govdata.de/)
- [Open-Data-Portal München (German)](https://www.opengov-muenchen.de/)
- [Searchable FCC ID Database](https://fccid.io/)

## Sanctions / PEP
- [PepChecker (R)](https://pepchecker.com) (R)
  PEP and sanctions screening tool offering checks against comprehensive PEP lists and global sanctions databases with a free tier of limited searches.
  _pricing: freemium; best for: Screening individuals against PEP lists and international sanctions databases_
- [Ukraine PEP Register (D)](https://pep.org.ua/en/) *(deprecated)*
  Formerly a database of Ukrainian politically exposed persons maintained by civil society. Now redirects to a static wartime advocacy page.
  _best for: Previously used for checking Ukrainian politically exposed persons_
- [EveryPolitician](https://everypolitician.org/)
  Global database of political office-holders now operated as part of the OpenSanctions project, providing structured data on politicians and public officials worldwide.
  _best for: Looking up current and former political office-holders globally for PEP screening_

# Business Records

## Annual Reports
- [AnnualReports.com](https://www.annualreports.com/)
  Free directory of annual reports for thousands of public companies worldwide. Allows browsing and downloading official investor relations documents.
  _best for: Locating and downloading public company annual reports_
- [Public Register Online](https://www.annualreportservice.com/)
  Online directory for accessing annual reports and financial documents from companies that participate in the service.
  _best for: Requesting hard copy or digital annual reports from participating companies_
- [Public Register's Annual Report Service](https://www.prars.com/search/alpha/A) (M)
  PRARS provides access to annual reports for thousands of publicly traded companies, organized alphabetically for browsing.
  _best for: Browsing annual reports for US public companies alphabetically_
- [International Registries](https://www.gov.uk/government/publications/overseas-registries/overseas-registries)
  UK government page listing official overseas company registries for countries worldwide, linking to each nation's official registration authority.
  _best for: Finding official company registry links for foreign jurisdictions_

## General Info & News
- [Commercial Register - Worldwide](https://www.sg.ch/recht/handelsregister-notariate.html)
  Canton of St. Gallen (Switzerland) official commercial register, providing a searchable database of businesses registered in the canton.
  _best for: Searching Swiss corporate registry for businesses registered in St. Gallen_
- [SEC.gov - EDGAR](https://www.sec.gov/submit-filings) (D)
  The SEC's Electronic Data Gathering, Analysis, and Retrieval system provides free public access to corporate filings including 10-K, 10-Q, 8-K, and proxy statements.
  _best for: Researching US public company financials, ownership, and regulatory filings_
- [International White Pages](https://www.wayp.com/)
  WAYP.com is an international white pages and business directory aggregating contact listings from multiple countries.
  _best for: International business and personal contact lookups by country_
- [UK Companies](https://www.gov.uk/get-information-about-a-company)
  Official UK government service providing free access to information about companies registered in England, Wales, Scotland, and Northern Ireland.
  _best for: Looking up UK-registered company details, officers, and filing history_
- [Global EDGE Resource Directory](https://globaledge.msu.edu/global-resources)
  MSU GlobalEdge curated directory of international business resources, organized by topic including trade, investment, finance, and country data.
  _best for: Finding international business intelligence resources and databases by topic_
- [Google Finance](https://www.google.com/finance/)
  Google's financial data platform providing stock quotes, financial statements, news, and company overviews for publicly traded companies.
  _best for: Quick financial overview, stock data, and news for public companies_

## Company Profiles
- [OpenCorporates](https://opencorporates.com/)
  The world's largest open database of companies, covering 200+ jurisdictions with over 200 million company records sourced directly from official registries.
  _pricing: freemium; best for: Cross-jurisdictional company research and corporate network mapping_
- [AIHIT](https://www.aihitdata.com/) (R)
  B2B company intelligence platform providing data on millions of businesses including executives, contact information, and company profiles.
  _pricing: freemium; best for: Company executive discovery and B2B contact data enrichment_
- [Plonked](https://www.plonked.com/) *(deprecated)*
  UK business directory service for locating companies and contact information.
  _best for: UK business lookup by name or location_
- [Buzzfile](https://www.buzzfile.com/Home/Basic)
  US company database providing business profiles, SIC codes, employee counts, and contact information for millions of US businesses.
  _pricing: freemium; best for: US business lookup by name, location, or industry classification_
- [LittleSis](https://littlesis.org/)
  Free database mapping relationships between powerful people and organizations, tracking political donors, lobbyists, board members, and corporate networks.
  _best for: Mapping power relationships between corporations, politicians, and elites_
- [Rusprofile](https://www.rusprofile.ru/)
  Russian company registry and business intelligence platform providing information on Russian legal entities from official government sources.
  _pricing: freemium; best for: Researching Russian companies, directors, and legal entity registration_
- [Companies House](https://beta.companieshouse.gov.uk/)
  Official UK government company registry for England, Wales, Scotland, and Northern Ireland. Provides free access to company filings, officers, and registration details.
  _best for: UK company registration details, directors, and filed accounts_
- [Company Data Rex (EU)](https://www.cdrex.com/)
  European company data aggregation platform providing business intelligence on EU-registered companies from multiple national registries.
  _pricing: freemium; best for: Cross-border EU company research and registry data lookup_
- [Europages](https://www.europages.co.uk:443/)
  European B2B marketplace and company directory covering 3+ million companies across 26 countries with product and service listings.
  _best for: Finding European suppliers, manufacturers, and B2B companies by industry_
- [Owler (R)](https://www.owler.com/corp) (R)
  Competitive intelligence platform providing company profiles, revenue estimates, employee counts, news alerts, and competitor tracking. Requires registration for full access.
  _pricing: freemium; best for: Competitive intelligence and company profile research_
- [Vault](https://vault.com/)
  Career research platform providing company profiles, employee reviews, salary data, and industry guides for job seekers and researchers.
  _pricing: freemium; best for: Company culture research, salary benchmarking, and employee sentiment analysis_
- [Companies In The UK](https://www.companiesintheuk.co.uk/)
  UK company search engine aggregating information from Companies House, providing easy lookup of registered UK businesses.
  _best for: Quick UK company lookup with simplified Companies House data_
- [UK Data](https://ukdata.com/)
  UK company information and credit data service providing business intelligence on UK-registered companies.
  _pricing: freemium; best for: UK company credit checks and financial health assessment_
- [Orbis Directory](https://orbisdirectory.bvdinfo.com/version-2016121/OrbisDirectory/Companies) (R)
  Bureau van Dijk's global company database covering 400+ million companies with standardized financial data, ownership structures, and M&A activity.
  _pricing: paid; best for: Deep financial analysis and global ownership structure research_
- [Crunchbase](https://www.crunchbase.com/#/home/index) (R)
  Leading startup and investment intelligence platform tracking company funding rounds, acquisitions, investors, and executive profiles.
  _pricing: freemium; best for: Startup funding research, investor mapping, and executive tracking_

## Employee Profiles & Resumes
- [RecruitEm](https://recruitin.net/) (D)
  Free X-Ray search tool for finding profiles on LinkedIn, GitHub, Twitter, and other platforms using Google's site: operator with customizable search parameters.
  _best for: X-Ray searching LinkedIn and other platforms for employee and candidate profiles_
- [LinkedIn](https://www.linkedin.com/) (D, R)
  World's largest professional network with 900+ million members. Provides company pages, employee listings, and professional history data.
  _pricing: freemium; best for: Professional background research, employee enumeration, and corporate structure mapping_
- [Jobster](https://jobster.com/) *(deprecated)*
  Early job search and professional networking site that aggregated job listings and professional profiles.
  _best for: Job listing and professional profile search (historical)_
- [XING (R)](https://www.xing.com/) (R)
  European professional networking platform popular in German-speaking countries. Provides company profiles, employee listings, and career data. Requires registration to view profiles.
  _pricing: freemium; best for: Professional background research for German and European contacts_
- [CVGadget](https://cvgadget.com/) (D) *(deprecated)*
  CV and resume search tool using Google X-Ray techniques to find publicly posted resumes and CVs on the web.
  _best for: Finding publicly posted resumes and CVs via Google X-Ray search_

## Additional Resources
- [RBA - Business Information Resources](https://www.rba.co.uk/sources/)
  Curated directory maintained by Researching Business Activities, linking to free and paid business information sources organized by category.
  _best for: Finding specialized business intelligence resources and databases by topic_
- [VAT Number Validation](https://ec.europa.eu/taxation_customs/vies/?locale=en)
  EU VIES (VAT Information Exchange System) allows validation of VAT numbers for businesses registered in EU member states.
  _best for: Validating EU VAT registration numbers and identifying registered businesses_

# Transportation

## Vehicle Records
- [MyAccident - traffic accident map](https://myaccident.org/)
  Free database of redacted US traffic accident reports with searchable crash records and location details.
  _best for: US accident history verification and claims investigations_
- [NHTSA Vehicle API](https://vpic.nhtsa.dot.gov/api/)
  Official US government VIN decoder API with vehicle specification and manufacturer data for model years 1981 onward.
  _best for: VIN decoding and US vehicle specification checks_
- [FindByPlate](https://findbyplate.com/)
  US license plate lookup service for basic vehicle identification and ownership-related investigation leads.
  _pricing: freemium; best for: US license plate-based vehicle investigations_
- [carVertical VIN Decoder](https://www.carvertical.com/vin-decoder) (R)
  International VIN and registration decoder with vehicle history reporting across accident, theft, and ownership datasets.
  _pricing: paid; best for: Cross-border vehicle history and ownership verification_
- [autoDNA VIN Lookup](https://www.autodna.com/) (R)
  Vehicle history lookup platform with records from European and North American markets and paid report expansion.
  _pricing: freemium; best for: VIN-based damage, ownership, and service history checks_
- [VinDecodr](https://vindecodr.com/)
  Free VIN decoder for quick extraction of standard vehicle characteristics from 17-character VIN values.
  _best for: Rapid vehicle specification lookup from VIN values_
- [AutoRef (EU)](https://www.autoref.eu/en) (R)
  European VIN and plate intelligence service with free and paid tiers for technical vehicle profile data.
  _pricing: freemium; best for: EU vehicle specification lookup and plate-to-VIN workflows_
- [Carnet.ai](https://carnet.ai/)
  AI vehicle image recognition platform that identifies make/model/generation from submitted photos.
  _pricing: freemium; best for: Vehicle identification from images in visual OSINT cases_
- [Finnik (NL)](https://finnik.nl/en) (R)
  Dutch license plate intelligence service using official RDW-linked records for vehicle profile and APK history.
  _pricing: freemium; best for: Netherlands plate investigations and inspection history checks_

## Air Traffic Records
- [Flightradar24.com](https://www.flightradar24.com/)
  Global real-time flight tracking platform built on ADS-B and radar feeds with airport and route intelligence views.
  _pricing: freemium; best for: Aircraft movement monitoring and flight status intelligence_
- [World Aeronautical Database](https://worldaerodata.com/)
  Reference database for airport, airline, and aircraft metadata to support aviation intelligence lookups.
  _pricing: freemium; best for: Aviation reference checks for airports, airlines, and aircraft_
- [ADS-B Exchange](https://www.adsbexchange.com/)
  Large community-driven unfiltered ADS-B flight tracking network with broad global aircraft coverage.
  _pricing: freemium; best for: Unfiltered aircraft tracking and historical flight pattern analysis_
- [ADS-B.NL](https://www.ads-b.nl/index.php?pageno=9999)
  Netherlands-focused ADS-B tracking portal with emphasis on military and regional aviation movements.
  _best for: European and military aircraft movement monitoring_
- [OpenAIP World Aeronautical Database](https://www.openaip.net/)
  Open, community-maintained aeronautical dataset for airfields, airspace, navaids, and runway metadata.
  _best for: Airspace and airfield intelligence with reusable open data_

## Marine Records
- [Vessel Tracker](https://www.vesseltracker.com/)
  Commercial maritime tracking platform combining AIS and satellite feeds for global vessel movement intelligence.
  _pricing: paid; best for: Maritime routing, vessel monitoring, and compliance investigations_
- [Ship AIS](https://shipais.uk/)
  UK-centered AIS ship tracker with live map views, movement details, and vessel identification data.
  _best for: UK maritime activity monitoring and vessel identification_
- [OpenSeaMap - The free nautical chart](https://www.openseamap.org)
  Open nautical chart map built on collaborative maritime data for ports, aids to navigation, and coastal context.
  _best for: Nautical geolocation and maritime infrastructure mapping_
- [Vessel Finder](https://www.vesselfinder.com/)
  Global AIS vessel tracking service for ship positions, voyage progress, and historical movement review.
  _pricing: freemium; best for: Worldwide ship tracking and port-call timeline analysis_
- [Global Fishing Watch](https://globalfishingwatch.org)
  Nonprofit maritime transparency platform that maps global fishing activity from AIS/VMS-derived signals.
  _best for: Illegal fishing detection and fisheries activity intelligence_

## Railway Records
- [Deutsche Bahn Open-Data-Portal (German)](https://data.deutschebahn.com/opendata)
  German rail open-data portal for station, network, timetable, and real-time transportation datasets.
  _best for: German rail infrastructure and schedule intelligence_
- [OpenRailwayMap](https://www.openrailwaymap.org/)
  OpenStreetMap-based global railway map visualizing rail lines, infrastructure characteristics, and operations context.
  _best for: Rail infrastructure mapping and line characteristic analysis_
- [Satellite Tracking](https://www.n2yo.com/)
  Satellite orbit tracking entry point for monitoring spacecraft position, trajectory, and pass predictions.
  _best for: Space object and satellite movement monitoring_
- [Track-Trace](https://www.track-trace.com/)
  Multi-carrier shipment tracking aggregator for parcel and freight status across global postal and logistics providers.
  _best for: Package tracking and supply-chain movement checks_

# Geolocation Tools / Maps

## Geolocation Tools
- [Astrometry](https://nova.astrometry.net/)
  Astrometry.net solves star-field images to estimate where and when a photo was taken.
  _best for: Geolocating night sky photos by star patterns_
- [SunCalc](https://suncalc.net/) (M)
  Solar position calculator for estimating time and orientation from shadows in imagery.
  _best for: Shadow-based time and location validation_
- [SunCalc](https://suncalc.org/) (M)
  Solar position calculator for estimating time and orientation from shadows in imagery.
  _best for: Shadow-based time and location validation_
- [GeoSpy](https://geospy.ai/) (R)
  AI-assisted image geolocation tool for estimating where a photo was taken.
  _pricing: freemium; best for: Rapid initial geolocation hypotheses from photos_

## Coordinates
- [GPSVisualizer](https://www.gpsvisualizer.com/geocode) (M)
  Coordinate and GPS utility for mapping, conversion, and geocoding operations.
  _best for: Converting and visualizing GPS/coordinate inputs_
- [Military Grid Reference System Coordinates](https://dominoc925-pages.appspot.com/mapplets/cs_mgrs.html) (M)
  MGRS coordinate conversion utility for military-style grid references.
  _best for: Converting MGRS values to lat/lon and back_
- [Batch Geocoding](https://www.doogal.co.uk/BatchGeocoding) (R)
  Bulk geocoding workflow that converts large address lists into latitude/longitude pairs.
  _pricing: freemium; best for: Converting large address datasets to coordinates_
- [Batch Reverse Geocoding](https://www.doogal.co.uk/BatchReverseGeocoding) (R)
  Bulk reverse-geocoding workflow that converts coordinate lists into human-readable addresses.
  _pricing: freemium; best for: Converting large coordinate sets into addresses_

## Map Reporting Tools
- [Hyperlapse (T)](https://github.com/TeehanLax/Hyperlapse.js) (T)
  Open-source JavaScript library for creating Street View hyperlapse animations.
  _best for: Generating time-lapse style Street View sequences_
- [Google Maps Streetview Player](https://brianfolts.com/driver/) (M)
  Street View path playback utility for reviewing route-level imagery sequences.
  _best for: Walking through street-level imagery along a route_
- [ScribbleMaps](https://www.scribblemaps.com/) (R, M)
  Collaborative web map editor for annotations, overlays, and shared incident maps.
  _best for: Producing and sharing annotated investigative maps_
- [Beholder](https://beholder.infragard.io/) (M)
  Real-time global event map aggregating public-source signals for situational awareness.
  _best for: Monitoring geolocated crisis and event signals in real time_
- [LiveUaMap](https://liveuamap.com/) (M)
  Conflict/event mapping platform that geolocates incidents from public reporting.
  _best for: Conflict and crisis event geolocation tracking_

## Mobile Coverage
- [OpenSignal](https://www.opensignal.com/)
  Crowdsourced mobile coverage and signal quality map from user telemetry.
  _pricing: freemium; best for: Comparing cellular signal quality by carrier and location_
- [AntennaSearch](https://www.antennasearch.com/)
  FCC-backed lookup for antenna structure and tower records used in RF and telecom investigations.
  _best for: Identifying nearby antenna structures and tower owners_
- [OpenCelliD](https://opencellid.org/) (R)
  Collaborative global cell-tower database used for telecom-based geolocation.
  _best for: Cell tower identification and approximate location triangulation_
- [beaconDB](https://beacondb.net/)
  Open geolocation database for Wi-Fi/Bluetooth/cell beacons used in location inference.
  _best for: Beacon and AP-based geolocation without major platform lock-in_
- [Google Maps](https://www.google.com/maps/)
  Google web mapping suite with satellite, terrain, route, and place intelligence layers.
  _best for: General geolocation, routing, and POI correlation_
- [Bing Maps](https://www.bing.com/maps)
  Microsoft web mapping service with road, aerial, and route layers for location analysis.
  _best for: General geolocation and route context with Microsoft map data_
- [HERE Maps](https://maps.here.com/)
  Enterprise-grade mapping platform with routing and global cartographic coverage.
  _pricing: freemium; best for: Commercial-grade map and route analysis_
- [Dual Maps](https://data.mashedworld.com/dualmaps/map.htm) (M)
  Dual-pane map viewer for side-by-side comparison of basemaps and imagery.
  _best for: Comparing two map layers or providers at the same location_
- [Instant Google Street View](https://www.instantstreetview.com/) (M)
  Fast launcher for jumping directly into Google Street View at precise locations.
  _pricing: freemium; best for: Quick street-level reconnaissance from an address or coordinate_
- [Wikimapia](https://wikimapia.org/#lang=en&lat=40.078071&lon=-100.458984&z=5&m=b) *(deprecated)*
  Crowdsourced landmark annotation layer with uneven maintenance and stale coverage in some regions.
  _best for: Supplementary user-labeled place context when newer sources are unavailable_
- [OpenStreetMap](https://www.openstreetmap.org/)
  Open-source global map edited by the community and widely reused in OSINT workflows.
  _best for: Open basemap and geospatial reference without vendor lock-in_
- [Flash Earth](https://zoom.earth/)
  Zoom Earth interface for rapidly reviewing weather and satellite imagery timelines.
  _best for: Fast satellite and weather imagery review_
- [Historic Aerials](https://www.historicaerials.com/?javascript=&) (R)
  Historical aerial imagery archive for property and infrastructure change analysis.
  _pricing: freemium; best for: Comparing land and infrastructure changes over decades_
- [Google Maps Update Alerts](https://followyourworld.appspot.com/) (R)
  Follow Your World alert utility for notifications on map and imagery updates.
  _best for: Tracking imagery refreshes for watched locations_
- [Google Earth Overlays](https://www.mgmaps.com/kml/) (M)
  Overlay workflow for layering KML/KMZ data onto Google Earth views.
  _best for: Overlaying external KML/KMZ intelligence layers on earth imagery_
- [Yandex.Maps](https://yandex.com/maps/)
  Regional mapping service with strong coverage in Russia and surrounding regions.
  _best for: Geolocation research in Russia/CIS where western maps are weaker_
- [Google Earth](https://earth.google.com/web/)
  3D globe and historical imagery platform for terrain and time-based visual analysis.
  _best for: Historical satellite and terrain review in 3D_
- [Baidu Maps](https://map.baidu.com/)
  Major Chinese mapping platform with strong POI and routing coverage in mainland China.
  _pricing: freemium; best for: Geolocation and POI discovery in mainland China_
- [Corona](https://corona.cast.uark.edu/) (R)
  Access point for historical CORONA-era satellite imagery used in long-range change analysis.
  _best for: Cold War-era historical imagery analysis_
- [Naver (Korean)](https://map.naver.com/p/)
  Korea-focused mapping platform with strong local POI and transit coverage.
  _pricing: freemium; best for: Geolocation and POI analysis in South Korea_
- [OpenStreetMap](https://www.openstreetmap.org/)
  Open-source global map edited by the community and widely reused in OSINT workflows.
  _best for: Open basemap and geospatial reference without vendor lock-in_
- [Overpass Turbo](https://overpass-turbo.eu/) (M)
  Query interface for extracting targeted OpenStreetMap features via Overpass API.
  _best for: Custom extraction of OSM entities by tags and geography_
- [EarthExplorer](https://earthexplorer.usgs.gov/) (R)
  USGS portal for Landsat, Sentinel, and other earth observation datasets.
  _best for: Downloading historical and multispectral satellite datasets_
- [OpenStreetCam](https://kartaview.org/)
  KartaView crowdsourced street-level imagery platform for geospatial verification.
  _best for: Street-level image review outside mainstream Street View coverage_
- [Travel by Drone](https://travelbydrone.com/)
  Drone-route and aerial exploration resource useful for planning vantage-aware terrain review.
  _best for: Planning drone-oriented visual reconnaissance paths_
- [Hivemapper](https://hivemapper.com/) (R)
  Decentralized, crowdsourced street imagery map network with expanding coverage.
  _pricing: freemium; best for: Street-level imagery in areas with limited mainstream coverage_
- [LandsatLook Viewer](https://landsatlook.usgs.gov/)
  USGS viewer for browsing Landsat scenes and multispectral imagery.
  _best for: Long-term environmental and infrastructure change detection_
- [NEXRAD Data Inventory Search](https://www.ncdc.noaa.gov/nexradinv/) (R)
  NOAA/NCDC index for searching archived NEXRAD radar datasets.
  _best for: Locating radar archives for weather-event correlation_
- [MapQuest](https://www.mapquest.com/)
  Web mapping and routing platform supporting multi-stop route planning.
  _best for: Route analysis and multi-stop planning_
- [OpenRailwayMap](https://www.openrailwaymap.org/)
  Rail-specific map layer showing tracks, stations, and related rail infrastructure.
  _best for: Rail network and station infrastructure mapping_
- [OpenInfrastructureMap](https://openinframap.org/)
  OSM-derived map overlays for power, telecom, water, and industrial infrastructure.
  _best for: Infrastructure mapping across energy and utility networks_
- [Hiking & Biking Map](https://hikebikemap.org/)
  OSM-based map optimized for trails, cycling routes, and terrain context.
  _best for: Outdoor trail and route reconnaissance_
- [US Nav Guide Zip Code Data](https://www.usnaviguide.com/)
  Zip-code lookup resource for correlating US postal areas with map context.
  _best for: Linking US zip codes to geographic lookup context_
- [Wayback Imagery](https://livingatlas.arcgis.com/wayback/)
  Esri Wayback archive for reviewing previous versions of world imagery basemaps.
  _best for: Recent-era imagery change detection across archived basemap releases_
- [SkyFi.com - Satellite Open Data (R)](https://app.skyfi.com/explore/open) (R)
  Satellite imagery marketplace and open-data discovery interface for earth observation assets.
  _pricing: freemium; best for: Finding open and commercial satellite scenes from one interface_

# Search Engines

## General Search
- [Google](https://www.google.com/?gws_rd=ssl) (D, M)
  World's most popular search engine with advanced indexing capabilities and support for extensive search operators (Google dorks). Used for passive OSINT research with broad web coverage.
  _best for: General web OSINT, historical information via cache, broad searches with operators_
- [Bing](https://www.bing.com/) (D, M)
  Microsoft's search engine with advanced search operators and API capabilities. Supports many of the same operators as Google, providing alternative search coverage.
  _best for: Alternative to Google, regional results, academic content, supplementary searches_
- [DuckDuckGo](https://duckduckgo.com/) (M)
  Privacy-focused search engine that doesn't track users or store personal data. Processes ~3 billion queries monthly with enhanced privacy protections and tracker blocking.
  _pricing: free/freemium; best for: Privacy-preserving searches, tracking-free OSINT research, European results_
- [Yahoo Advanced Web Search](https://search.yahoo.com/web/advanced) (D, M)
  Yahoo's advanced search interface with support for search operators including site:, intitle:, filetype:, AND, OR, NOT. Provides real-time search results data with location filtering.
  _best for: Alternative to Google/Bing, specialized searches, location-based results_
- [StartPage](https://www.startpage.com/) (D, M)
  Privacy-centric proxy search engine that strips identifying data before querying Google/Bing and provides anonymous view to visited websites through proxy servers.
  _pricing: free/freemium; best for: Privacy-preserving Google searches, anonymous browsing through proxy_
- [Yandex](https://yandex.com/) (D, M)
  Russian search engine with excellent coverage of post-Soviet digital spaces. Supports 20+ advanced operators and provides faster indexing of Russian forums and breach boards than Google.
  _best for: Russian/post-Soviet OSINT, faster breach board indexing, regional coverage_
- [Baidu](https://www.baidu.com/) (D, M)
  China's dominant search engine with support for advanced search operators and knowledge graph data. Used for Chinese language and regional OSINT research.
  _best for: Chinese language OSINT, Chinese market research, regional search coverage_
- [Google Advanced Search](https://www.google.com/advanced_search) (D, M)
  Dedicated interface to Google's advanced search operators. Makes complex queries easier to construct without memorizing dork syntax through visual form-based interface.
  _best for: Guided advanced searches, learning Google operators, constructing complex queries visually_
- [iZito](https://www.izito.com/)
  Metasearch engine aggregating results from multiple sources including Wikipedia, videos, news, and products. Designed to support non-linear search behavior with multi-column display.
  _best for: Multi-type searches (web, video, news, products in one overview), quick result aggregation_
- [Advangle](https://advangle.com/) (D, M)
  Advanced search query builder for Google and Bing. Allows construction of complex multi-parameter search queries without memorizing operator syntax.
  _best for: Building complex search queries with multiple filters (domain, language, date published)_
- [Instya](https://www.instya.com/)
  eCommerce product search engine and shopping discovery platform. NOT suitable for general web OSINT research - category mismatch with Search Engines.
  _best for: Product research, shopping comparisons, eCommerce OSINT only_
- [Hulbee](https://hulbee.com/de)
  Corporate site and product page for Hulbee AG. NOT a search engine itself - Hulbee is the company behind Swisscows. URL/category mismatch issue.
  _pricing: free/freemium; best for: Corporate information only, NOT for web search OSINT_
- [Mojeek](https://mojeek.com/) (D, M)
  Independent UK-based search engine with its own crawler and index. Privacy-focused with no user tracking since 2006. Supports advanced search operators.
  _pricing: free/freemium; best for: Privacy-preserving searches, independent index not reliant on Google/Bing_
- [Swisscows](https://swisscows.com/en)
  Swiss privacy-focused search engine using semantic AI. Stores all data in Swiss Alps facility. No cookies, no tracking, no user profiles. Includes family-safe filtering.
  _pricing: free/freemium; best for: Privacy-conscious searches, family-safe content filtering, Swiss data residency requirement_
- [Brave](https://search.brave.com/) (M)
  Privacy-focused search engine with independent index. Offers Goggles for custom search result ranking. First search API with zero data retention option.
  _pricing: free/freemium; best for: Privacy-preserving searches, custom filtering via Goggles, enterprises needing zero data retention_
- [Stract](https://stract.com/) (T, D, M)
  Open source search engine built by developers for developers. Features customizable Optics for result filtering and ranking. Independent index with web crawler.
  _best for: Developers, transparency enthusiasts, customizable search, filtering by content type (blogs, indieweb, educational)_

## Meta Search
- [iSEEK](https://iseek.com/iseek/home.page) *(deprecated)*
  Meta search engine that aggregated results from multiple sources. Service offline - URL returns 404 error. No longer operational.
  _best for: Historical reference only - service no longer operational_
- [eTools.ch](https://www.etools.ch/)
  Swiss privacy-focused metasearch engine aggregating 14+ sources (Google, Bing, Brave, DuckDuckGo, Yandex, etc.) simultaneously. Fast results averaging 0.83 seconds.
  _best for: Privacy-preserving meta searches, quick result aggregation from multiple engines_

## Code Search
- [PublicWWW](https://publicwww.com/)
  Source code search engine for HTML, JavaScript, CSS, and plaintext across 509+ million web pages. Find websites using specific analytics IDs, ad accounts, or code snippets.
  _pricing: free/freemium; best for: Finding websites with specific code/analytics IDs, competitive intelligence, security research_
- [Searchcode](https://searchcode.com/)
  Code search engine that indexes public source code from GitHub, GitLab, Bitbucket, and other repositories; useful for finding code examples and identifying technology usage patterns.
  _pricing: freemium; best for: Source code snippet and function discovery across public repositories_
- [NerdyData](https://www.nerdydata.com/reports/new) (R)
  Source code search engine for website technology reconnaissance that indexes HTML, CSS, and JavaScript across millions of live websites to identify technology and library usage.
  _pricing: freemium; best for: Identifying websites using specific technologies, libraries, or code patterns_
- [Gitrob (T)](https://github.com/michenriksen/gitrob) (T)
  CLI tool for reconnaissance on GitHub organizations and users; clones repositories and scans commit history for sensitive files, exposed credentials, and configuration data.
  _best for: GitHub organization reconnaissance for exposed secrets and sensitive files in commit history_
- [Github-Dorks (T)](https://github.com/techgaun/github-dorks) (T, D)
  Collection of GitHub advanced search operators and a CLI tool that automates searching GitHub for exposed credentials, API keys, configuration files, and other sensitive information.
  _best for: Finding exposed credentials and sensitive files on GitHub via advanced search dorks_
- [GitLeaks](https://github.com/gitleaks/gitleaks) (T)
  Open-source SAST tool for detecting hardcoded secrets, API keys, passwords, and credentials in git repositories and file systems using customizable regex-based detection rules.
  _best for: Scanning git repositories for hardcoded secrets, API keys, and leaked credentials_

## FTP Search
- [GlobalFile](https://globalfilesearch.com/) (M)
  FTP file search engine that indexes publicly accessible FTP servers; allows searching for specific file types including images, videos, software, and archives.
  _best for: Discovering publicly accessible files on FTP servers by filename or file type_
- [FTP Google Dork (D)](https://www.google.com/search?q=inurl%3Aftp+-inurl%3Ahttp+-inurl%3Ahttps+ftpsearchterm) (D, M)
  Google dork technique using inurl:ftp operators to discover publicly indexed FTP server directories and files through Google's web index.
  _best for: Discovering publicly indexed FTP server directories and files via Google dorking_
- [Napalm FTP](https://www.searchftps.net/)
  FTP indexer and search engine with over 329 million files indexed across 1,200+ FTP servers; supports advanced filtering by file type, size, and server location.
  _best for: Large-scale FTP file discovery across hundreds of indexed public servers_

## Academic / Publication Search
- [PubPeer](https://pubpeer.com/)
  Post-publication peer review platform where researchers comment on and flag issues with published scientific papers; useful for identifying retracted or problematic research.
  _best for: Verifying scientific publication credibility and finding post-publication corrections or retractions_
- [Bielefeld Academic Search Engine](https://www.base-search.net/Search/Advanced)
  Academic search engine indexing over 400 million documents from 12,000+ content providers including institutional repositories, open-access journals, and research databases worldwide.
  _best for: Broad academic literature search across open-access and institutional repositories_
- [Google Scholar](https://scholar.google.com/)
  Multidisciplinary academic search engine indexing journal articles, theses, books, conference papers, and patents; includes citation counts and related work discovery.
  _best for: Comprehensive academic literature discovery with citation tracking across all disciplines_
- [PubMed - National Center for Biotechnology Information](https://pubmed.ncbi.nlm.nih.gov/)
  Free biomedical and life sciences literature database maintained by the NCBI with over 40 million citations; includes abstracts and links to full-text articles.
  _best for: Biomedical, clinical, and life sciences literature research with high-quality metadata_
- [Open Library](https://openlibrary.org/)
  Internet Archive's open catalog of over 3 million books with borrowable digital editions; provides bibliographic data and full-text access for many out-of-print titles.
  _best for: Finding and borrowing digitized books, especially out-of-print or historical publications_
- [JURN](https://www.jurn.org/)
  Multidisciplinary search engine indexing freely accessible academic articles; covers arts, humanities, ecology, and social sciences with a focus on open-access content.
  _best for: Open-access academic article discovery in arts, humanities, and social sciences_
- [UK National Archives](https://discovery.nationalarchives.gov.uk/)
  Official online catalog for the UK National Archives providing access to over 32 million records spanning 1,000 years of UK government, legal, and historical documents.
  _best for: UK historical records, government documents, and legal archives research_
- [OpenGrey EU Papers](https://opengrey.eu/) *(deprecated)*
  Former European grey literature database maintained by INIST-CNRS that indexed non-conventional scientific and technical documents; archived in 2020 and no longer updated.
  _best for: Historical European grey literature and non-conventional scientific documents (pre-2020)_
- [US Gov Publishing Office - FDsys](https://www.gpo.gov/fdsys/) *(deprecated)*
  Legacy US Government Publishing Office document system (FDsys) that has been superseded by GovInfo (govinfo.gov); the URL now redirects to the modernized GovInfo platform.
  _best for: US federal government publications, congressional records, and regulatory documents (use GovInfo instead)_
- [OpenDOAR](https://www.opendoar.org/search.php)
  Global directory of open-access repositories with over 6,000 academic repositories from 130+ countries; useful for locating institutional repositories and discipline-specific archives.
  _best for: Finding open-access repositories by institution, country, or subject discipline_
- [Microsoft Academic](https://academic.microsoft.com/)
  Microsoft's academic search service indexing hundreds of millions of research papers; note that the original Microsoft Academic service was discontinued in December 2021 and this URL may redirect.
  _best for: Academic paper discovery with author disambiguation and citation graph analysis_
- [Science Direct](https://www.sciencedirect.com/)
  Elsevier's platform for peer-reviewed scientific literature with access to over 2,900 journals and 30,000 e-books; freely searchable with full-text access requiring subscription or institutional access.
  _pricing: freemium; best for: Scientific and technical literature search across Elsevier's extensive journal catalog_
- [Think Tank Search](https://guides.library.harvard.edu/hks/think_tank_search) *(deprecated)*
  Harvard Kennedy School Library guide for searching think tank research and policy reports; the referenced Think Tank Search service was deprecated in February 2025.
  _best for: Policy research and think tank report discovery (see Policy Commons as current alternative)_
- [Library Databases](https://guides.uflib.ufl.edu/az.php)
  University of Florida Library's A-Z database directory providing access to hundreds of academic databases covering all disciplines; useful as a reference for locating specialized research databases.
  _best for: Identifying specialized academic databases by subject for deep literature research_
- [Copyscape Plagiarism Checker](https://www.copyscape.com/)
  Online plagiarism detection service that searches the web for copies of submitted text or URLs; useful for verifying content originality or tracing where text has been republished.
  _pricing: freemium; best for: Detecting plagiarism and tracing where specific text or content has been copied or republished online_
- [Lazy Scholar (T)](https://lazyscholar.org/) (T)
  Browser extension that automatically finds free legal full-text versions of academic papers when viewing paywalled content; checks open-access repositories and PubMed Central.
  _best for: Finding free full-text access to paywalled academic papers without institutional subscription_
- [Open Access Scholarly Journals](https://www.pagepress.org/)
  PAGEPress open-access publisher hosting peer-reviewed journals across biomedical, natural, and social sciences; provides free access to published research articles.
  _best for: Accessing open-access peer-reviewed research in biomedical and natural sciences_
- [The Open Syllabus Project](https://www.opensyllabus.org/)
- [Science Publications](https://www.thescipub.com/)
- [arXiv.org](https://arxiv.org/)

## News Search
- [Google News Search](https://news.google.com/news/advanced_news_search?)
- [Flipboard](https://flipboard.com/)
- [YouGotTheNews](https://yougotthenews.com/)
- [NewspaperARCHIVE.com](https://newspaperarchive.com/)
- [PressReader.com](https://www.pressreader.com/)
- [Newspaper Map](https://newspapermap.com/)
- [NewsBrief](https://emm.newsbrief.eu/NewsBrief/clusteredition/en/latest.html)
- [AllYouCanRead.com](https://www.allyoucanread.com/)
- [World News](https://wn.com/#/search)
- [NewsNow.co.uk](https://www.newsnow.co.uk/h/)
- [Hubii](https://hubii.com/)
- [Inshorts](https://inshorts.com/en/read)
- [NewsBot](https://getnewsbot.com/)

## Other Search
- [Colossus International Engine List](https://www.searchenginecolossus.com/)
- [Zenodo](https://zenodo.org/)
- [EntityCube](https://entitycube.research.microsoft.com/)
- [FindTheData A Research Engine](https://www.findthedata.com/)

## Search Tools
- [wayparam](https://github.com/aleff-github/wayparam)
- [SearchDiggity (T)](https://bishopfox.com/resources)
- [Scanner-inurlbr (T)](https://github.com/googleinurl/SCANNER-INURLBR)
- [Google Alerts](https://www.google.com/alerts)
- [Google Custom Search Engine](https://cse.google.com/cse/)
- [pagodo - Passive Google Dork (T)](https://github.com/opsdisk/pagodo) (T, D)
  Python CLI tool that automates passive Google dork searches using the Google Hacking Database (GHDB), supporting HTTP/SOCKS5 proxies to avoid rate-limiting.
  _best for: Automated passive Google dork enumeration from GHDB_
- [Google Trends](https://trends.google.com/trends/) (M)
  Google's free tool for analyzing search interest trends over time and by geography, providing anonymized and aggregated data.
  _best for: Tracking topic interest, comparing search terms, identifying trend patterns_
- [dorksearch.com](https://www.dorksearch.com/) (D, M)
  Web-based Google dork builder and search tool that integrates with Shodan, Censys, and GitHub for comprehensive OSINT searches.
  _best for: Building complex Google dorks with API cross-referencing_
- [dorkgenerator.pages.dev](https://dorkgenerator.pages.dev/) (D, M)
  Online dork generator for creating custom Google search parameter queries to assist in OSINT and security research.
  _best for: Quick generation of custom Google dork queries_
- [dorksearch.netlify.app](https://dorksearch.netlify.app/) (D, M)
  Lightweight web interface for building and executing Google dork searches with minimal dependencies.
  _best for: Fast, simple Google dork query generation_

## Search Engine Guides
- [Google Hacking Database](https://www.exploit-db.com/google-hacking-database) (D)
  Offensive Security's curated database of Google dork queries, organized by category, used for finding sensitive information exposed on the web.
  _best for: Finding proven dork queries by category for security research_
- [Google Search Operators Guide](https://www.googleguide.com/advanced_operators_reference.html)
  Official Google documentation covering all supported search operators, syntax, and advanced search techniques.
  _best for: Reference for Google search operator syntax and capabilities_
- [Google Guide Cheat Sheet](https://www.googleguide.com/help/calculator.html)
  Quick-reference cheat sheet for Google search operators and advanced search syntax from Google Guide.
  _best for: Quick lookup of Google search operator syntax_

# Online Communities

## Blog Search Engines
- [Live Journal Seek](https://ljseek.com/) (M)
  Search tool for LiveJournal journals and communities across public entries that are indexed.
  _best for: Finding public LiveJournal entries and historical community discussions_
- [Blog Search Engine](https://www.blogsearchengine.org/) (M)
  Blog-focused search engine for discovering blog posts, directories, and RSS-connected content.
  _best for: Blog discovery and topic-focused blog post searching_

## Discord Servers
- [Discord Bot List](https://discord.bots.gg/)
  Searchable directory of Discord bots with listings, categories, and discovery metadata.
  _best for: Discord bot discovery and ecosystem mapping_
- [ReconXplorer (T)](https://github.com/root7am/ReconXplorer) (T)
  Open-source reconnaissance toolkit with modules for IP, email, and Discord-focused lookups.
  _best for: Multi-input OSINT checks from a local scriptable toolkit_
- [Top.gg](https://top.gg/)
  Large Discord bot and app discovery platform with ranking, filtering, and listing data.
  _best for: Discord bot ranking analysis and app discovery_

## Forum Search Engines
- [BoardReader](https://boardreader.com/) (D, M)
  Forum search engine that indexes discussions across message boards and community platforms.
  _best for: Finding forum threads and topic-centric discussion history_
- [Omgili](https://webz.io/) (D, M)
  Forum and discussion search capability operated through Webz.io infrastructure and data products.
  _pricing: freemium; best for: Forum discussion discovery with optional API-driven workflows_
- [Craigslist Forums](https://forums.craigslist.org/) (D, M)
  Craigslist-hosted forum system for public community discussions and region-oriented threads.
  _best for: Reviewing Craigslist community discussions and regional forum activity_
- [Delphi Forum Search](https://www.delphiforums.com/) (M)
  Forum platform with searchable user communities across niche interest categories.
  _pricing: freemium; best for: Niche forum discovery and historical community thread review_
- [Google Groups Search](https://groups.google.com/forum/#!overview) (D, M)
  Search interface for Google Groups and archived discussion content, including historical threads.
  _best for: Researching archived mailing-list and discussion-group content_

## IRC Search
- [Mibbit](https://search.mibbit.com/) *(deprecated)*
  Former web IRC client and channel search service that is no longer operational.
  _best for: Legacy reference for historical IRC channel search workflows_
- [IRCP (T)](https://github.com/internet-relay-chat/IRCP) (T)
  Python-based IRC probing utility for scanning servers and collecting network/channel metadata.
  _best for: IRC server enumeration and protocol-level reconnaissance_
- [ircsnapshot (T)](https://github.com/bwall/ircsnapshot) (T)
  IRC data collection tool that connects bots to servers for user and channel mapping.
  _best for: IRC topology mapping and user/channel relationship analysis_
- [netsplit.de](https://netsplit.de/channels/search.php) (D, M)
  IRC directory and search portal for channel listings, network stats, and discovery workflows.
  _best for: Passive IRC channel discovery and network trend checks_

## Reddit Communities
- [Arctic Shift](https://arctic-shift.photon-reddit.com/)
  Search and access layer for Reddit datasets with tools for historical content retrieval and analysis.
  _pricing: freemium; best for: Historical Reddit dataset analysis and subreddit research_
- [Cama's Reddit Search](https://camas.github.io/reddit-search/)
  Web tool for searching Reddit posts and comments by author, subreddit, text, and time filters.
  _best for: Reddit user and subreddit content discovery_
- [Reveddit](https://www.reveddit.com/) (M)
  Interface for viewing Reddit content removals using archived and moderation-related visibility signals.
  _best for: Investigating deleted or removed Reddit discussions_

# Archives

## Web
- [Anna's Archive](https://annas-archive.org/) (R)
  Meta-search index for books and papers that aggregates links from multiple shadow libraries.
  _best for: Locating mirrored copies of books and papers from multiple sources_
- [Archive.is](https://archive.is/) (M)
  On-demand web snapshot service that preserves point-in-time copies of pages and shortens archive links.
  _best for: Capturing and retrieving snapshots of volatile web pages_
- [Browsershots](https://browsershots.org/) *(deprecated)*
  Legacy cross-browser screenshot service historically used to render pages in multiple browser/OS combinations.
  _best for: Historical reference for legacy browser rendering captures_
- [Cached Pages](https://www.cachedpages.com/) (M)
  Web cache lookup utility that surfaces archived and cached versions of a target page from multiple sources.
  _best for: Finding recent cached copies of pages that changed or disappeared_
- [Cached View](https://cachedview.com/) (M)
  Simple cache-checking service that retrieves copies of pages from search engine and archive caches.
  _best for: Quick verification of whether a removed page still exists in cache_
- [Common Crawl](https://commoncrawl.org/) (M)
  Open repository of large-scale web crawl data published as monthly WARC datasets.
  _best for: Large-scale historical web content mining and corpus analysis_
- [Internet Archive: Wayback Machine](https://web.archive.org/) (M)
  Web archive providing historical snapshots of websites captured over time.
  _best for: Historical website analysis and deleted content recovery_
- [PDF My URL](https://pdfmyurl.com/) (M)
  Converts web pages into downloadable PDF captures for documentation and evidence preservation.
  _pricing: freemium; best for: Generating quick PDF evidence captures of web pages_
- [Screenshots.com](https://www.screenshots.com/) (R, M)
  Website screenshot archive and capture service for viewing historical or current rendered page images.
  _pricing: freemium; best for: Visual timeline checks of website appearance changes_
- [Wayback Machine Chrome Extension](https://chrome.google.com/webstore/detail/wayback-machine/fpnmgdkabkmnadcjpehmlllkndpkmiak) (T)
  Browser extension that detects missing pages and loads historical versions from the Wayback Machine.
  _best for: Fast archive lookups while browsing dead or changed pages_
- [Textfiles.com](https://textfiles.com/)
  Historic repository preserving early internet text artifacts including BBS files, documents, and underground zines.
  _best for: Researching legacy digital culture and historical text archives_
- [UK Web Archive](https://www.webarchive.org.uk/ukwa/) (M)
  British Library-led archive preserving selected UK websites and related national web heritage content.
  _best for: Accessing preserved UK web content and historical domain captures_
- [Waybackpack (T)](https://github.com/jsvine/waybackpack) (T)
  Command-line tool for bulk downloading archived captures from the Internet Archive Wayback Machine.
  _best for: Batch export of historical snapshots for offline analysis_
- [Web Archive-RU](https://web-arhive.ru/) (M)
  Regional web archiving service focused on preserving and browsing snapshots of selected websites.
  _best for: Supplemental archive checks when mainstream archives lack coverage_
- [WebCite](https://www.webcitation.org:443/query) (M) *(deprecated)*
  Citation-focused web preservation service with legacy archived records and limited query capabilities.
  _best for: Retrieving historical citation captures that still remain accessible_

## Data Leaks
- [Cryptome](https://cryptome.org/)
  Long-running disclosure archive hosting leaked or hard-to-find government, intelligence, and policy documents.
  _best for: Searching historical leaked documents and primary-source disclosures_
- [Databases.Today](https://databases.today/) (R, M)
  Breach data discovery portal indexing exposed databases and leaked credential collections.
  _pricing: freemium; best for: Identifying whether target identifiers appear in known breach dumps_
- [WikiLeaks](https://wikileaks.org/) (M)
  Global document leak publication platform containing diplomatic, military, and corporate disclosures.
  _best for: Searching high-impact leaked document collections for historical context_

## Public Datasets
- [Labeled Faces in the Wild DB](https://vis-www.cs.umass.edu/lfw/)
  Academic benchmark dataset of labeled face photographs collected from the public web.
  _best for: Facial recognition benchmarking and person-image research baselines_
- [Stanford Large Network Dataset Collection](https://snap.stanford.edu/data/#amazon) (M)
  SNAP repository of graph/network datasets spanning social networks, web graphs, and communication systems.
  _best for: Network analysis modeling and graph-based OSINT experimentation_
- [UCI Spambase Data Set](https://archive.ics.uci.edu/dataset/94/spambase) (M)
  Classic UCI machine-learning dataset for spam classification and email feature analysis.
  _best for: Email spam model benchmarking and feature-engineering practice_
- [Visual Genome](https://visualgenome.org/)
  Structured image dataset linking objects, attributes, and scene graph relationships for visual understanding research.
  _best for: Image relationship analysis and multimodal data research_

## Other Media
- [TV Closed Caption Search](https://archive.org/details/tv) (M)
  Internet Archive TV News collection for searching closed-caption text across broadcast recordings.
  _best for: Finding broadcast mentions by keyword and time period_

# Language Translation

## Text
- [Bing Translate](https://translator.bing.com/)
  Microsoft's neural translation service for text and web content across 100+ languages.
  _best for: Quick translation of text and webpages_
- [Cambridge Dictionary](https://dictionary.cambridge.org/)
  Dictionary and learner reference platform with translation support across multiple language pairs.
  _best for: Word-level translation and bilingual dictionary lookups_
- [DeepL Translator](https://www.deepl.com/en/translator)
  AI-powered machine translation service focused on high-quality translation with document support.
  _pricing: freemium; best for: High-accuracy translation of documents and technical text_
- [Free Translation](https://translation2.paralink.com/)
  Multi-provider web translator for quick text translation across many language pairs.
  _best for: Fast multi-language text translation in a browser_
- [Google Input Tools](https://www.google.com/inputtools/)
  Google input method utility for typing and transliteration across many scripts and languages.
  _best for: Typing non-Latin scripts and transliterated input_
- [Google Translate](https://translate.google.com/)
  Google's web translation platform covering hundreds of languages for text and website translation.
  _best for: Quick translation across broad language coverage_
- [Slang Dictionary & Translator](https://www.noslang.com/)
  NoSlang provides internet slang definitions and reverse translation for common texting shorthand.
  _best for: Decoding internet slang and text abbreviations_
- [Slangit - The Slang Dictionary](https://slang.net/)
  Online slang dictionary focused on modern internet and texting terminology with usage context.
  _best for: Understanding current online slang and acronym usage_
- [Urban Dictionary](https://www.urbandictionary.com/)
  Crowdsourced slang reference that tracks contemporary colloquialisms and culture-specific definitions.
  _best for: Interpreting emerging slang and culture-driven terms_
- [Wiktionary](https://en.wiktionary.org/)
  Collaborative multilingual dictionary and translation reference hosted by the Wikimedia ecosystem.
  _best for: Word definitions, etymology, and multilingual term translation_
- [Word Reference](https://www.wordreference.com/)
  Bilingual dictionary platform with conjugation tables, forum context, and language-pair references.
  _best for: Word-level translation with conjugation and usage context_

## Pictures
- [i2OCR](https://www.i2ocr.com/)
  Free browser OCR service with broad multilingual support for extracting text from image and document files.
  _best for: Multilingual OCR extraction without account creation_
- [New OCR](https://www.newocr.com/)
  Web OCR utility powered by Tesseract for text extraction from multiple file formats and scanned images.
  _best for: General-purpose OCR from scanned pages and images_
- [Online OCR (SodaPDF)](https://www.sodapdf.com/pdf-tools/ocr-pdf/)
  SodaPDF's online OCR workflow for converting scanned PDFs and images into searchable text output.
  _pricing: freemium; best for: OCR conversion of scanned PDFs for editing_
- [Online OCR (onlineocr.net)](https://www.onlineocr.net/)
  Browser OCR service for converting scanned images and PDFs to editable document formats.
  _pricing: freemium; best for: Quick OCR to Word, Excel, or plain text_

## Videos

## Analysis
- [WhatTheFont](https://www.myfonts.com/pages/whatthefont/)
  Image-based font identification service that matches uploaded text images against a large commercial font catalog.
  _best for: Identifying unknown fonts from screenshots or photos_

# Mobile OSINT

## Android

### Emulation Tools
- [Genymotion (T)](https://www.genymotion.com/) (T, R)
  Cloud-based and desktop Android emulator platform for app testing and forensic analysis. Supports multi-instance deployment and integration with security testing tools.
  _pricing: freemium; best for: Testing mobile apps, forensic analysis, multi-device simulation_
- [BlueStacks 2 (T)](https://www.bluestacks.com/) (T)
  Free, lightweight Android emulator for desktop. Includes built-in forensic capabilities for data extraction from installed apps.
  _best for: Quick Android testing, forensic artifact extraction, app analysis_
- [Nox App Player](https://www.bignox.com/) (T)
  Free Android emulator with support for multiple Android versions and root access. Used for app analysis and testing.
  _best for: Android version testing, app analysis, rooted device simulation_
- [Apk Online](https://apk.online/)
  Browser-based tool for analyzing and downloading APK files. Allows viewing app permissions, features, and metadata without installation.
  _best for: Quick APK analysis, permission review, app feature reconnaissance_

### Apps

#### Social Networking
- [Facebook (T)](https://www.facebook.com/) (D, R)
  Major social network with over 2 billion users. Primary target for social OSINT and profile reconnaissance.
  _best for: Profile reconnaissance, relationship mapping, photo analysis, location tracking_
- [LinkedIn (T)](https://www.linkedin.com/) (D, R)
  Professional social network with 900M+ users. Key source for professional identity verification and corporate structure mapping.
  _pricing: freemium; best for: Professional background verification, corporate reconnaissance, employment history research_
- [Twitter (T)](https://www.twitter.com/) (D, R)
  Microblogging platform with 500M+ users. Extensive public data, real-time information, and relationship networks.
  _best for: Real-time monitoring, account verification, relationship mapping, sentiment analysis_
- [Pinterest (T)](https://www.pinterest.com/) (D, R)
  Visual discovery platform with 460M+ users. Used for lifestyle, location, and interest-based profiling.
  _best for: Interest profiling, location discovery, lifestyle analysis, image reverse search_

#### Instant Messaging
- [Signal Private Messenger (T)](https://signal.org/) (T, R)
  End-to-end encrypted messaging app with 40M+ users. Limited OSINT value due to privacy-first design.
  _best for: Identity verification, account discovery via phone/email, community research_
- [Riot.im - Communicate, your way (T)](https://riot.im/) (T)
  Open-source Matrix client for decentralized messaging. Limited public data but useful for community monitoring.
  _best for: Open community monitoring, channel discovery, user verification_
- [Telegram (T)](https://telegram.org/) (T, R)
  Messaging platform with 700M+ users. Extensive public data through public channels, groups, and user searches.
  _best for: User discovery, channel monitoring, group reconnaissance, bot creation for data collection_
- [Snapchat (T)](https://www.snapchat.com/) (T, R)
  Ephemeral messaging app with 400M+ users. Limited historical data due to auto-deletion, but real-time activity visible.
  _best for: User verification, story analysis, location tracking via snap maps, relationship mapping_
- [WhatsApp Messenger (T)](https://www.whatsapp.com/) (T, R)
  Messaging platform with 2B+ users. End-to-end encrypted, but profile data and metadata are accessible.
  _best for: User verification, profile discovery, status updates, contact verification_
- [Kik (T)](https://www.kik.com/) (T, R)
  Messaging app with 300M+ registered users. Public username search and profile visibility.
  _best for: User discovery, profile analysis, public username search_
- [Yik Yak (T)](https://www.yikyak.com/) (T, R)
  Anonymous location-based social network. Public posts visible by location, useful for community sentiment and event tracking.
  _best for: Location-based event monitoring, community sentiment analysis, anonymity assessment_
- [LINE (T)](https://line.me/) (T, R)
  Messaging app with 200M+ users, dominant in Asia. User search and public profile visibility.
  _best for: Asian market user discovery, profile analysis, account verification_

#### Pictures
- [Instagram (T)](https://www.instagram.com/) (D, R)
  Photo and video sharing platform with 2B+ users. Extensive visual OSINT and metadata analysis.
  _best for: Visual reconnaissance, metadata analysis, location tracking via geotagging, relationship mapping_
- [Flickr (T)](https://www.flickr.com/) (D)
  Photo hosting and sharing platform with 200M+ photos. Extensive metadata and location data.
  _pricing: freemium; best for: Photo metadata analysis, EXIF data extraction, location tracking, photographer identification_

#### Streaming Video
- [Periscope (T)](https://www.periscope.tv/) (T, R)
  Live video streaming app merged into Twitter. Limited standalone value; functionality integrated into Twitter.
  _best for: Live event monitoring, real-time location tracking (via broadcast metadata), community monitoring_
- [Meerkat (T)](https://meerkatapp.co/) (T, R)
  Live streaming social app. Currently dormant with minimal active users; historical value for archived streams.
  _best for: Legacy stream archives, historical event analysis_
- [Vine (T)](https://vine.co/) *(deprecated)*
  Short-form video platform shut down by Twitter in January 2017. No longer operational.
  _best for: Historical video archives only (via archive services)_
- [Truecaller (T)](https://www.truecaller.com/) (T, R)
  Phone and contact verification app with 500M+ users. Reverse phone lookup and caller ID identification.
  _pricing: freemium; best for: Phone number verification, caller ID lookup, spam detection, contact validation_

## App Analysis
- [APKLeaks](https://github.com/dwisiswant0/apkleaks) (T)
  Open-source tool that scans APK files for hardcoded secrets, API endpoints, and sensitive information.
  _best for: API endpoint discovery, hardcoded credential detection, sensitive data extraction from APKs_
- [APKtool](https://apktool.org/) (T)
  Open-source tool for reverse engineering Android apps. Decompiles APKs to extract resources and bytecode.
  _best for: APK decompilation, resource extraction, smali code analysis, app structure analysis_
- [JADX](https://github.com/skylot/jadx) (T)
  Open-source decompiler (47k+ GitHub stars) that converts DEX bytecode to Java source code. GUI and CLI available.
  _best for: Java source code recovery, app logic analysis, vulnerability assessment, code review_
- [MobSF](https://github.com/MobSF/Mobile-Security-Framework-MobSF) (T)
  Open-source mobile security framework for static and dynamic analysis. Comprehensive vulnerability scanning and artifact extraction.
  _best for: Comprehensive mobile app security analysis, vulnerability assessment, artifact extraction, compliance testing_

## Device Forensics
- [Autopsy](https://www.autopsy.com/) (T)
  Open-source digital forensics platform. Extracts and analyzes data from mobile devices and disk images.
  _best for: Mobile forensic artifact extraction, database analysis, file system recovery, evidence analysis_
- [Frida](https://frida.re/) (T)
  Open-source dynamic instrumentation toolkit. Injects JavaScript to intercept and modify app behavior at runtime.
  _best for: Runtime behavior analysis, API call interception, encryption bypass, behavior modification_

## iOS
- [Charles Proxy](https://www.charlesproxy.com/) (T, R)
  Commercial HTTP/HTTPS proxy for traffic analysis. Captures and analyzes network traffic between apps and servers.
  _pricing: paid; best for: Network traffic interception, API endpoint mapping, parameter analysis, encryption analysis_
- [Lynxio OSINT](https://lynxio.io/) (R)
  Mobile OSINT search tool for multi-identifier reconnaissance. Searches across phone numbers, email addresses, usernames, and social platforms.
  _pricing: freemium; best for: Multi-identifier search, quick reconnaissance, phone number lookup, email verification_
- [OSINT Researcher](https://apps.apple.com/us/app/osint-researcher/id6747302251) (T)
  iOS app for GitHub organization reconnaissance and open-source intelligence. Limited to App Store distribution.
  _best for: GitHub OSINT, organization structure analysis, open-source project discovery, team reconnaissance_

# Dark Web

## General Info
- [Reddit Deep Web](https://www.reddit.com/r/deepweb/)
  Subreddit focused on dark web discussions, beginner guidance, and community-sourced OSINT references.
  _best for: Community discussion on dark web OSINT topics_
- [Reddit Onions](https://www.reddit.com/r/onions/)
  Subreddit for .onion service discussion, availability reports, and tool recommendations.
  _best for: Tracking .onion ecosystem changes via community reports_
- [Reddit Darknet](https://www.reddit.com/r/darknet/)
  Community forum discussing darknet marketplaces, ecosystem events, and related threat activity.
  _best for: Market ecosystem pulse and discussion-driven lead generation_

## Clients
- [Tor Download (T)](https://www.torproject.org/download/) (T)
  Official Tor Project distribution page for Tor Browser and related anonymity tooling.
  _best for: Obtaining trusted Tor Browser binaries_
- [Freenet Project (T)](https://www.hyphanet.org/) (T)
  Hyphanet (formerly Freenet) is a decentralized, privacy-oriented network for anonymous publishing and file sharing.
  _best for: Anonymous peer-to-peer content distribution_
- [I2P Anonymous Network (T)](https://i2p.net/) (T)
  I2P is an anonymous overlay network supporting eepsites, messaging, and peer-to-peer services.
  _best for: Accessing and hosting services inside the I2P anonymity network_

## Discovery
- [OnionScan](https://github.com/s-rah/onionscan) (T)
  Open-source scanner for .onion services that identifies metadata leaks and potential OPSEC weaknesses.
  _best for: Assessing exposed metadata and weak configurations on hidden services_
- [TorBot](https://github.com/DedSecInside/TorBot) (T)
  Python-based crawler for discovering and indexing .onion links and related metadata.
  _best for: Automated dark web crawling and onion link collection_
- [Tor Scan](https://www.torscan.io/) (T) *(deprecated)*
  Legacy or ambiguous dark web scanning entry with unclear maintenance and uncertain distinction from OnionScan.
  _best for: Legacy reference for Tor scanning workflows pending mapping cleanup_
- [Onioff](https://github.com/k4m4/onioff) (T)
  Onion URL inspection utility for checking reachability and extracting metadata from hidden service links.
  _best for: Quick inspection of onion links and service metadata_
- [Hunchly Hidden Services Report](https://darkweb.hunch.ly/) (R)
  Daily feed of newly observed hidden services and associated monitoring data from Hunchly.
  _best for: Monitoring new hidden-service discovery trends_
- [docker-onion-nmap (T)](https://github.com/milesrichardson/docker-onion-nmap) (T) *(deprecated)*
  Dockerized nmap/proxychains workflow for enumerating exposed ports on onion services through Tor.
  _best for: Containerized port enumeration of hidden services_
- [Onion Investigator](https://oint.ctrlbox.com/) *(deprecated)*
  Ambiguous investigation entry with limited current validation and unclear relation to other onion analysis tools.
  _best for: Legacy onion investigation reference pending mapping decision_

## TOR Search
- [Onion Cab](https://onion.cab/)
  Dark web search/directory endpoint with intermittent reliability and limited contemporary documentation.
  _best for: Supplemental onion discovery when primary search tools miss coverage_
- [Ahmia](https://ahmia.fi/)
  Well-known Tor search engine indexing onion services with clearnet accessibility for discovery workflows.
  _best for: Primary onion search and service discovery_

## TOR Directories
- [Hidden Wiki](https://thehiddenwiki.org/) *(deprecated)*
  Historically popular onion directory with variable trustworthiness, mirror churn, and high link rot.
  _best for: Historical reference for onion directory structures_
- [Web O Proxy](https://weboproxy.com/) *(deprecated)*
  Web-based onion proxy/gateway style entry with uncertain current reliability and attribution risk.
  _best for: Legacy gateway access reference for onion destinations_
- [IACA Dark Web Investigation Support](https://iaca-darkweb-tools.com/)
  International Anti Crime Academy dark web investigation support portal for federated search workflows.
  _best for: Federated dark web investigation support and discovery_

# Disinformation & Media Verification

## Deepfake Detection
- [DeepFake-Detect](https://github.com/dessa-oss/DeepFake-Detection) (T)
  Open-source deepfake detection project built with PyTorch and ResNet18 for classifying manipulated media.
  _best for: Research-grade deepfake detection model experimentation_
- [DeepFake-Image-Detection](https://github.com/rmkemker/DeepFake-Image-Detection) (T) *(deprecated)*
  Archived deepfake image detection repository previously used for forensic model experimentation.
  _best for: Historical reference for legacy deepfake image detection approaches_
- [DeepSafe](https://github.com/siddharthksah/DeepSafe) (T)
  Containerized deepfake detection suite combining multiple models with both web and extension interfaces.
  _best for: Ensemble deepfake detection for image and video investigations_
- [DeepfakeBench](https://github.com/SCLBD/DeepfakeBench) (T)
  Benchmark framework for deepfake detection with multiple datasets and standardized evaluation pipelines.
  _best for: Comparing deepfake detector performance across common benchmarks_
- [DeepfakeDetector](https://github.com/TRahulsingh/DeepfakeDetector) (T, M)
  Open-source deepfake detector with EfficientNet-based models and a web-facing analysis workflow.
  _best for: Rapid deepfake checks with optional self-hosted deployment_
- [FaceForensics++](https://www.faceforensics.com/) (R)
  Academic deepfake forensics dataset with manipulated video samples, masks, and aligned benchmarks.
  _best for: Training and benchmarking deepfake detection models_
- [InVID-WeVerify Verification Plugin](https://www.invid-project.eu/tools-and-services/invid-verification-plugin/) (T)
  Journalist-focused browser plugin for media verification, reverse image search, metadata checks, and video keyframe analysis.
  _best for: Social media image/video verification workflows_
- [TruthScan Deepfake Detector](https://truthscan.com/) (R)
  Cloud-based deepfake detection platform offering forensic analysis for manipulated video and audio.
  _pricing: freemium; best for: Operational deepfake triage with enterprise-grade reporting_

## Fact-checking Tools
- [Duke Reporters' Lab](https://reporterslab.org/)
  Duke University journalism lab tracking global fact-checking initiatives, tools, and ecosystem trends.
  _best for: Finding and benchmarking fact-checking organizations worldwide_
- [Hoaxy](https://hoaxy.osome.iu.edu/) *(deprecated)*
  Visualization platform for tracking how claims and fact-checking spread through social media networks.
  _best for: Historical social diffusion analysis of misinformation and debunks_
- [PolitiFact](https://www.politifact.com/)
  Fact-checking publication that rates political claims and documents supporting evidence.
  _best for: Verifying political statements and tracing source-backed ratings_
- [SciCheck](https://factcheck.org/scicheck/)
  FactCheck.org section dedicated to scientific and health misinformation analysis.
  _best for: Validating scientific and medical claims in public discourse_
- [Snopes](https://www.snopes.com/)
  Long-running debunking site covering rumors, hoaxes, and viral misinformation claims.
  _best for: Rapid validation of widely shared rumors and internet folklore_
- [Stop Fake Tools](http://www.stopfake.org/)
  Ukrainian anti-disinformation initiative publishing fact-checks, analysis, and media literacy resources.
  _best for: Investigating Ukraine-focused propaganda and disinformation narratives_

## Reverse Media Search
- [ImgOps](https://imgops.com/) (M)
  Meta-search utility that routes an image to multiple reverse search and forensic services.
  _best for: Fast multi-engine reverse image analysis from one entry point_
- [TinEye Reverse Image Search](https://tineye.com/) (M)
  Reverse image search engine that finds where an image appears online and identifies modified versions.
  _pricing: freemium; best for: Tracing original publication and reuse of visual media_

## Source Verification
- [FotoForensics](https://fotoforensics.com/) (M)
  Image forensics platform with error level analysis and metadata-oriented integrity checks.
  _best for: Detecting likely image manipulation and compression artifacts_
- [Verification Handbook](https://verificationhandbook.com/)
  Reference handbook for journalists covering verification methodologies for digital investigations.
  _best for: Learning repeatable verification workflows for UGC and breaking news_
- [Verification Junkie](https://verificationjunkie.com/)
  Curated directory of verification resources, tools, and training materials for journalists.
  _best for: Discovering verification tools and practitioner-oriented references_

# Blockchain & Cryptocurrency

## Bitcoin
- [Bitcoin Who's Who](https://www.bitcoinwhoswho.com/)
  Bitcoin address profiling and scam reporting platform with community-driven address tagging for fraud detection and wallet identification.
  _best for: Bitcoin address scam reports and community tagging_
- [BitRef](https://bitref.com/)
  Bitcoin address balance checker and transaction analyzer supporting address clustering, mempool data, mining statistics, and developer API.
  _pricing: freemium; best for: Bitcoin address balance lookup and transaction analysis_
- [Blockonomics](https://www.blockonomics.co/)
  Bitcoin payment API and OSINT platform providing address monitoring, wallet balance tracking, and transaction alerts for developers and enterprises.
  _pricing: freemium; best for: Bitcoin payment integration and address monitoring for developers_
- [Blockr.io](https://blockr.io/) *(deprecated)*
  Legacy Bitcoin blockchain explorer acquired by Coinbase in August 2014 and no longer maintained as standalone service.
  _best for: Historical reference only (service discontinued)_
- [Blocktrail](https://www.blocktrail.com/BTC) *(deprecated)*
  Bitcoin transaction analysis platform acquired by Bitmain in July 2016 and rebranded to BTC.com; original service no longer operational.
  _best for: Historical reference only (rebranded to BTC.com)_
- [Orbit (T)](https://github.com/s0md3v/Orbit) (T)
  Python CLI tool for Bitcoin wallet network analysis that visualizes transaction relationships through recursive crawling and graph rendering.
  _best for: Bitcoin transaction network visualization and wallet relationship mapping_
- [Wallet Explorer](https://www.walletexplorer.com/)
  Bitcoin address clustering and wallet linking tool using multi-input heuristics to identify related addresses and track entity-level transaction patterns.
  _pricing: freemium; best for: Bitcoin address clustering and entity wallet identification_

## Chain Analysis Platforms
- [Bitcoin Abuse Database](https://bitcoinabuse.com/)
  Community-curated Bitcoin address abuse database tracking addresses associated with ransomware, fraud, scams, and illicit activities.
  _best for: Identifying Bitcoin addresses linked to scams and ransomware_
- [Bitcoin Who's Who](https://www.bitcoinwhoswho.com/)
  Bitcoin address profiling and scam reporting platform with community-driven address tagging for fraud detection and wallet identification.
  _best for: Bitcoin address scam reports and community tagging_
- [BitRef](https://bitref.com/)
  Bitcoin address balance checker and transaction analyzer supporting address clustering, mempool data, mining statistics, and developer API.
  _pricing: freemium; best for: Bitcoin address balance lookup and transaction analysis_
- [Blockchair](https://blockchair.com/)
  Multi-chain blockchain explorer supporting 48+ blockchains (Bitcoin, Ethereum, Litecoin, Solana, etc.) with advanced search, SQL-like queries, and privacy-focused design (Tor accessible, no tracking).
  _pricing: freemium; best for: Cross-chain address and transaction search with privacy-friendly interface_
- [Blockscan](https://blockscan.com/)
  Multichain EVM blockchain explorer aggregating 25+ EVM-compatible chains with portfolio tracking, real-time data, and in-depth analytics.
  _pricing: freemium; best for: EVM-chain portfolio aggregation and cross-chain transaction tracking_
- [Etherscan](https://etherscan.io/)
  Leading blockchain explorer, analytics, and API platform for Ethereum and 60+ EVM-compatible chains with comprehensive smart contract interaction tracking and developer tools.
  _pricing: freemium; best for: Ethereum and EVM transaction analysis, smart contract inspection, token tracking_
- [OXT.me](https://oxt.me/)
  Bitcoin blockchain analysis platform providing address probability scoring, transaction graph visualization, and timeline-based balance analysis for privacy research.
  _best for: Bitcoin address privacy analysis and transaction probability scoring_
- [Wallet Explorer](https://www.walletexplorer.com/)
  Bitcoin address clustering and wallet linking tool using multi-input heuristics to identify related addresses and track entity-level transaction patterns.
  _pricing: freemium; best for: Bitcoin address clustering and entity wallet identification_

## DeFi & DEX Tracing
- [DefiLlama](https://defillama.com/)
  DeFi analytics platform aggregating Total Value Locked (TVL), yields, protocol revenue, and fees across 7000+ protocols on 500+ chains.
  _pricing: freemium; best for: DeFi protocol TVL comparison and yield aggregation across chains_
- [Dune Analytics](https://dune.com/)
  Onchain data analytics platform enabling SQL queries against indexed blockchain data for 100+ blockchains with interactive dashboard and visualization tools.
  _pricing: freemium; best for: Custom blockchain data analysis and dashboard creation via SQL queries_

## Ethereum
- [Etherscan](https://etherscan.io/)
  Leading blockchain explorer, analytics, and API platform for Ethereum and 60+ EVM-compatible chains with comprehensive smart contract interaction tracking and developer tools.
  _pricing: freemium; best for: Ethereum and EVM transaction analysis, smart contract inspection, token tracking_

## Mixer Tracking
- [Arkham Intelligence](https://intel.arkm.com/) (R)
  AI-powered blockchain intelligence platform mapping 300+ million address labels and 150K+ entity pages using proprietary Ultra system for entity deanonymization and fund-flow tracking.
  _pricing: freemium; best for: Institutional-grade cryptocurrency entity mapping and fund-flow analysis_
- [Breadcrumbs.app](https://www.breadcrumbs.app/)
  Community-powered blockchain analytics platform with fund-flow visualization (PathFinder), address investigation, and crypto transaction network mapping.
  _pricing: freemium; best for: Crypto fund-flow visualization and transaction relationship mapping_
- [MetaSleuth](https://metasleuth.io/) (R)
  Cross-chain cryptocurrency tracking and AML platform supporting 13 blockchains with fund-tracing through mixers using time/amount heuristics and network analysis.
  _pricing: freemium; best for: Cross-chain fund tracking and mixer analysis for compliance investigations_
- [MistTrack](https://misttrack.io/) (R)
  Comprehensive AML and fund-tracing platform with 400M+ labeled wallet addresses, compliance database integration (OFAC, NBCTF, UK HMT), and real-time monitoring for 100K+ users.
  _pricing: freemium; best for: Institutional AML compliance and suspicious transaction flagging_
- [OFAC Sanctions List Search](https://sanctionssearch.ofac.treas.gov/)
  Official U.S. Treasury Department tool for searching the Specially Designated Nationals (SDN) list and consolidated sanctions lists using fuzzy-logic name matching.
  _best for: Checking against U.S. government sanctions list (SDN and consolidated lists)_

## Monero
- [Monero Blocks](https://localmonero.co/blocks/)
  Monero blockchain explorer displaying blocks, transactions, and network statistics for the privacy-focused Monero cryptocurrency.
  _best for: Monero block and transaction lookup with basic privacy-coin exploration_
- [XMRChain.net](https://xmrchain.net/)
  Minimal Monero blockchain explorer with no JavaScript, cookies, or tracking; available via Tor with focus on privacy and open-source design.
  _best for: Monero transaction lookup with privacy-first design (Tor-accessible)_

## Multi-Chain Explorers
- [Bitquery Explorer](https://explorer.bitquery.io/)
  Multi-chain blockchain explorer with GraphQL API supporting 40+ blockchains, real-time streaming, and advanced querying for token trades, transfers, and smart contract events.
  _pricing: freemium; best for: Advanced cross-chain data querying and real-time blockchain event tracking_
- [Blockchair](https://blockchair.com/)
  Multi-chain blockchain explorer supporting 48+ blockchains (Bitcoin, Ethereum, Litecoin, Solana, etc.) with advanced search, SQL-like queries, and privacy-focused design (Tor accessible, no tracking).
  _pricing: freemium; best for: Cross-chain address and transaction search with privacy-friendly interface_

## NFT Provenance
- [Etherscan NFT Tracker](https://etherscan.io/nft)
  NFT-specific section of Etherscan for tracking ERC-721 and ERC-1155 token transfers, marketplace activities, and collection-level statistics.
  _pricing: freemium; best for: Ethereum NFT transaction tracking and collection analysis_
- [OpenSea](https://opensea.io/)
  Multi-chain NFT marketplace supporting 22+ blockchains (Ethereum, Solana, Arbitrum, Optimism, etc.) with transaction history, collection analytics, and trading data.
  _pricing: freemium; best for: Multi-chain NFT trading history and collection-level analysis_

## Privacy Coin Analysis
- [XMRChain.net (Monero)](https://xmrchain.net/)
  Minimal Monero blockchain explorer with no JavaScript, cookies, or tracking; available via Tor with focus on privacy and open-source design.
  _best for: Monero transaction lookup with privacy-first design (Tor-accessible)_
- [Zcash Block Explorer](https://blockchair.com/zcash)
  Zcash blockchain explorer (hosted on Blockchair) supporting transparent and shielded transaction analysis for privacy-coin OSINT with transaction filtering and address lookup.
  _pricing: freemium; best for: Zcash transparent transaction tracking (limited privacy-coin OSINT)_

## Wallet Clustering & Address Analysis
- [Blockchair](https://blockchair.com/)
  Multi-chain blockchain explorer supporting 48+ blockchains (Bitcoin, Ethereum, Litecoin, Solana, etc.) with advanced search, SQL-like queries, and privacy-focused design (Tor accessible, no tracking).
  _pricing: freemium; best for: Cross-chain address and transaction search with privacy-friendly interface_
- [Wallet Explorer](https://www.walletexplorer.com/)
  Bitcoin address clustering and wallet linking tool using multi-input heuristics to identify related addresses and track entity-level transaction patterns.
  _pricing: freemium; best for: Bitcoin address clustering and entity wallet identification_

# Classifieds
- [Craigslist](https://charlotte.craigslist.org/) (D, M)
  One of the largest free online classifieds platforms in the US, covering jobs, housing, for sale, services, and community posts organized by metropolitan area.
  _best for: Searching local US classifieds by city, vehicle/property fraud investigations, locating individuals via posts_
- [Kijiji - Canada Classifieds](https://www.kijiji.ca:443/) (D, M)
  Canada's largest free online classifieds marketplace covering vehicles, real estate, jobs, and general merchandise listings across Canadian cities.
  _best for: Canadian classified investigations, vehicle/property fraud research, locating subjects via listings_
- [Quikr - India Classifieds](https://www.quikr.com/) (D, M)
  Major Indian online classifieds platform for buying and selling goods, services, vehicles, and real estate across hundreds of Indian cities.
  _best for: Indian classifieds investigations, tracking subjects through local listings, fraud research_
- [eBay](https://www.ebay.com/) (D, M)
  Global e-commerce and online auction marketplace; valuable for OSINT research on seller profiles, item histories, and cross-referencing usernames.
  _best for: Seller profile research, username cross-referencing, item provenance tracking, fraud investigation_
- [OfferUp](https://offerup.com/) (D, M)
  US-focused mobile-first marketplace for local buying and selling of goods, with user profiles that may include ratings, reviews, and item listing history.
  _best for: Local US marketplace investigations, seller profile research, connecting listings to individuals_
- [Goofbid](https://www.goofbid.com/) (M)
  eBay auction search and sniping tool that finds misspelled eBay listings and provides advanced search features to surface hard-to-find items.
  _best for: Finding overlooked eBay listings, researching items through misspelled keywords, auction intelligence_
- [SearchAllJunk](https://www.searchalljunk.com/) (M)
  Classifieds metasearch engine that searches across multiple classified platforms simultaneously including Craigslist and similar sites.
  _best for: Cross-platform classifieds search, aggregating listings from multiple sources simultaneously_
- [TotalCraigSearch](https://www.totalcraigsearch.com/) (M)
  Search tool that enables cross-city and nationwide searches across Craigslist, bypassing the site's single-city search limitation.
  _best for: Nationwide Craigslist searches, tracking listings across multiple cities for a single subject or item_
- [Search Tempest](https://www.searchtempest.com/) (M)
  Nationwide Craigslist search tool that searches all Craigslist cities simultaneously with advanced filtering by distance, price range, and category.
  _pricing: freemium; best for: Multi-city Craigslist investigations, nationwide item or person search across classifieds_
- [francais-a-londres.org - French Classifieds](https://francaisalondres.com/) (D, M)
  French-language classifieds site for the French community in London covering housing, jobs, services, and items for sale.
  _best for: Investigating French-speaking subjects in the UK, Franco-British community connections_
- [Kleinanzeigen.de](https://www.kleinanzeigen.de/) (D, M)
  Germany's largest classified ads platform (formerly eBay Kleinanzeigen) for vehicles, real estate, electronics, and general merchandise.
  _best for: German classifieds investigations, German-speaking subject research, vehicle and property fraud research_

# Encoding / Decoding

## Barcodes / QR
- [ClearImage Barcode Reader](https://online-barcode-reader.inliteresearch.com/)
  Web-based barcode and QR code recognition tool using Inlite Research ClearImage technology for common image and document formats.
  _best for: Barcode and QR code decoding from uploaded files_

## Javascript
- [JS Beautifier](https://beautifier.io/)
  Open-source JavaScript formatter that rewrites minified or obfuscated code into readable, consistently indented source.
  _best for: Fast readability improvements for packed JavaScript_
- [JS NICE](https://jsnice.org/) *(deprecated)*
  Legacy JavaScript reverse-engineering service that previously improved variable names and recovered structure from minified code.
  _best for: Historical reference for JavaScript decompilation workflows_
- [Firebug (T)](https://getfirebug.com/downloads/) (T) *(deprecated)*
  Former Firefox debugging extension that has been retired, with core functionality absorbed into modern Firefox Developer Tools.
  _best for: Historical context for legacy JavaScript debugging references_
- [SpiderMonkey (T)](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey) (T)
  Mozilla JavaScript engine used by Firefox and available for standalone execution and analysis in local environments.
  _best for: Local JavaScript execution and behavior testing without browser UI_
- [Kahu Revelo (T)](https://www.kahusecurity.com/tools/) (T, R)
  Windows-focused JavaScript deobfuscation utility that executes scripts in a controlled environment to reveal hidden logic.
  _best for: Unpacking heavily obfuscated JavaScript samples on Windows_
- [JavaScript Deobfuscator (T)](https://addons.mozilla.org/en-US/firefox/addon/javascript-deobfuscator/) (T)
  Firefox add-on for inspecting and deobfuscating JavaScript in-browser during page analysis and script review.
  _best for: Browser-native JavaScript deobfuscation during web investigations_

## PHP
- [DDecode - PHP Decoder](https://ddecode.com/phpdecoder/)
  Online decoder for layered PHP obfuscation chains such as eval, base64, gzinflate, and related encoding wrappers.
  _best for: Rapid decoding of obfuscated PHP webshell and malware snippets_

## XOR

### Unix
- [XORSearch & XORStrings (T)](https://blog.didierstevens.com/programs/xorsearch/) (T)
  Didier Stevens command-line utilities for locating XOR, ROL, ROT, and SHIFT-encoded strings in suspicious binaries.
  _best for: String extraction and key hunting in encoded malware payloads_
- [xortool (T)](https://github.com/hellman/xortool) (T)
  Python-based XOR analysis tool that estimates key lengths and recovers likely multi-byte keys via frequency analysis.
  _best for: Recovering repeating XOR keys from encoded files_
- [unxor (T)](https://github.com/tomchop/unxor) (T)
  Known-plaintext XOR analysis utility for deriving keystreams and recovering original content from encoded samples.
  _best for: Known-plaintext XOR cracking against malware and encoded artifacts_

### Windows
- [Kahu Converter Utilities (T)](https://www.kahusecurity.com/tools/) (T)
  Windows utility collection for format conversion, hex/binary transforms, and XOR-related decoding workflows.
  _best for: Mixed conversion and XOR utility operations on Windows_

### Python
- [iheartxor.py (T)](https://hooked-on-mnemonics.blogspot.com/p/iheartxor.html) (T)
  Python script for brute-forcing XOR-obfuscated strings within defined boundaries to reveal hidden text in malware samples.
  _best for: Targeted extraction of XOR-obfuscated strings from binaries_
- [XORBruteForcer.py (T)](https://github.com/jesparza/scripts/blob/master/xorBruteForcer.py) (T)
  Single-byte XOR brute-force Python script that iterates candidate key values and surfaces matching decoded output.
  _best for: Single-byte XOR key brute-forcing and quick validation_
- [NoMoreXOR.py (T)](https://github.com/hiddenillusion/NoMoreXOR) (T)
  Python utility for recovering long XOR keys using character frequency heuristics and YARA-assisted pattern matching.
  _best for: Recovering long XOR keys in malware binaries_
- [Balbuzard (T)](https://github.com/decalage2/balbuzard) (T)
  Python malware analysis toolkit that extracts indicators and brute-forces common obfuscation patterns including XOR and rotation transforms.
  _best for: Automated deobfuscation and indicator extraction from suspicious files_
- [CyberChef](https://gchq.github.io/CyberChef/) (T)
  GCHQ-maintained browser workbench for chained encoding, decoding, hashing, crypto, and data transformation operations.
  _best for: Building and replaying multi-step decode and transform recipes_
- [Functions Online](https://www.functions-online.com/)
  PHP-oriented online utility suite for common encoding, decoding, hashing, and string-manipulation function tests.
  _best for: Quick PHP-specific encoding and decoding checks in browser_

# Tools

## OSINT Automation
- [Vector (T)](https://github.com/thesaderror/vector) (T) *(deprecated)*
  Python-based OSINT tool that gathers social media accounts, finds locations, contact information, and performs leak database searches with graph-based data visualization.
  _best for: Username enumeration across social media platforms_
- [DataSploit (T)](https://github.com/datasploit/datasploit/) (T, R) *(deprecated)*
  OSINT framework that performs reconnaissance on domains, emails, usernames, and phone numbers by aggregating data from multiple sources into consolidated intelligence reports.
  _best for: Multi-target reconnaissance (domain/email/username/phone aggregation)_
- [Omnibus (T)](https://github.com/InQuest/omnibus) (T, R)
  Interactive CLI OSINT tool for investigating artifacts (IPs, domains, emails, usernames, hashes, Bitcoin addresses) with over 25 integrated OSINT modules.
  _best for: Comprehensive multi-source artifact investigation with modular extensibility_
- [Photon (T)](https://github.com/s0md3v/Photon) (T)
  Fast Python web crawler designed for OSINT that extracts URLs, emails, social media accounts, files, API keys, JavaScript endpoints, and DNS records from websites.
  _best for: Web reconnaissance and endpoint discovery_
- [ReconDog (T)](https://github.com/s0md3v/ReconDog) (T, R) *(deprecated)*
  Reconnaissance Swiss Army Knife that performs passive API-based reconnaissance on targets including DNS lookups, Censys queries, CMS detection, and subdomain enumeration.
  _best for: Multi-function passive reconnaissance with modular capabilities_
- [IFTTT](https://ifttt.com/) (R)
  No-code automation platform connecting 900+ apps and services with trigger-action applets for automating workflows and data collection.
  _pricing: freemium; best for: Automation and notification workflows for social media monitoring_
- [Slash](https://github.com/redc86/slash) (T)
  Automated OSINT tool for username enumeration across 187+ social media platforms, forums, and pastebin searches with phone/email extraction.
  _best for: Username enumeration and social media account discovery_
- [Stringify](https://www.stringify.com/) (R) *(deprecated)*
  IoT home automation and smart home workflow platform with automation capabilities.
  _best for: Not applicable (defunct service)_
- [OSRFramework (T)](https://github.com/i3visio/osrframework) (T)
  GNU AGPLv3+ OSINT framework with modular tools for username enumeration, email searching, domain checking, and DNS analysis across multiple platforms.
  _best for: Comprehensive username and email enumeration with extensible architecture_
- [Inquisitor (T)](https://github.com/penafieljlm/inquisitor) (T) *(deprecated)*
  Organization-centric OSINT footprinting tool that automates asset discovery, ownership correlation, and relationship visualization.
  _best for: Corporate/organizational asset discovery and correlation_
- [AutoOSINT (T)](https://github.com/bharshbarger/AutOSINT) (T, R) *(deprecated)*
  Python automation tool integrating multiple OSINT modules (whois, DNS, HIBP, Shodan, Pastebin) with docx report generation.
  _best for: Automated domain/email reconnaissance with report generation_
- [IntRec-Pack (T)](https://github.com/NullArray/IntRec-Pack) (T)
  Bash script bundle for automated download, installation, and deployment of 14 OSINT and recon tools.
  _best for: Streamlined OSINT tool environment setup and deployment_
- [OSINT-SPY (T)](https://github.com/SharadKumar97/OSINT-SPY) (T, R) *(deprecated)*
  Python multi-target OSINT reconnaissance tool supporting email, domain, IP, organization, and blockchain analysis with SSL/TLS testing.
  _best for: Multi-vector reconnaissance (domains, IPs, emails, blockchain)_
- [Microsoft Flow](https://flow.microsoft.com/en-us/) (R)
  Microsoft cloud workflow automation platform enabling complex multi-step processes with 1000+ pre-built connectors for integrating OSINT workflows.
  _pricing: freemium; best for: Orchestrating OSINT workflows across multiple platforms/APIs_
- [PhoneInfoga (T)](https://github.com/sundowndev/PhoneInfoga) (T)
  Go-based phone number reconnaissance framework validating numbers and aggregating metadata from phone directories, search engines, and reputation databases.
  _best for: Phone number validation and intelligence gathering_
- [IntelligenceX](https://intelx.io/) (R)
  Web-based intelligence search platform aggregating pastes, leaks, darknet content, stealer logs, and public records across Tor, I2P, and surface web.
  _pricing: freemium; best for: Leaked data, breach database, and darknet intelligence searching_
- [Scrummage (T)](https://github.com/matamorphosis/Scrummage) (T, R)
  Python/Flask OSINT aggregator centralizing search plugins for blockchain, domains, breaches, darkweb, threat intelligence, IP geolocation, and social media.
  _best for: Multi-source OSINT aggregation via unified web interface_
- [Analyst Research Tools](https://analystresearchtools.com)
  Comprehensive web-based OSINT platform with 40+ integrated tools for people search, social media analysis, username enumeration, and archive searching.
  _best for: Multi-category OSINT: people search, social media, archives, email discovery_

## Graph Visualization
- [MIDINS TITAN](https://github.com/Med0-n/Midins_Titan-Osint_Tool) *(deprecated)*
  Unable to verify; URL unresponsive. Possible connection refusal or offline status.
  _pricing: unknown; best for: Unable to determine_

## Pentesting Recon
- [Low Hanging Fruit (T)](https://github.com/blindfuzzy/LHF) (T) *(deprecated)*
  Modular Python penetration testing reconnaissance tool automating Nmap, Arachni, load balancer detection, and domain scanning.
  _best for: Automated recon scanning during penetration tests_

## Virtual Machines
- [VMware Workstation Player (T)](https://www.vmware.com/products/player/playerpro-evaluation.html) (T)
  Free lightweight desktop virtualization application for running multiple operating systems on a single computer without rebooting.
  _best for: Desktop virtualization for personal/educational use_
- [VirtualBox (T)](https://www.virtualbox.org/) (T)
  Open-source, general-purpose full virtualization software supporting x86_64 hardware across laptops, desktops, servers, and embedded systems.
  _best for: Desktop and server virtualization; OSINT lab environments_
- [Buscador OS (T)](https://inteltechniques.com/buscador/index.html) (T)
  Specialized OSINT-focused Linux virtual machine pre-configured with dozens of OSINT tools for online investigations.
  _best for: OSINT investigations; pre-configured OSINT toolkit_
- [Kali Linux OS (T)](https://www.kali.org/) (T)
  Open-source Debian-based distribution with 600+ pre-installed security tools for penetration testing, security research, and reverse engineering.
  _best for: Penetration testing; security research; red team operations; OSINT research_
- [ParrotSec OS (T)](https://www.parrotsec.org/) (T)
  Efficient, lightweight security-focused Linux distribution with strong privacy and anonymity features for penetration testing and privacy-conscious computing.
  _best for: Penetration testing; red team; privacy-conscious computing; cybersecurity research_
- [Microsoft Edge Development OS VMs (T)](https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/) (T) *(deprecated)*
  Free virtual machines provided by Microsoft for testing Edge browser and web standards across different Windows versions.
  _best for: Web development; Edge browser compatibility testing_
- [Subgraph OS (T)](https://subgraph.com/index.en.html) (T)
  Adversary-resistant alpha-stage operating system featuring hardened kernel, application sandboxing, built-in Tor integration, and memory-safe Golang applications.
  _best for: High-security threat model; adversary resistance; encrypted communications_
- [Tails Live OS (T)](https://tails.boum.org/) (T)
  Portable Debian-based operating system designed for anonymous communication and privacy protection, running entirely from USB with no traces left after shutdown.
  _best for: High-anonymity OSINT; Tor-based anonymous communication for journalists and activists_
- [Whonix (T)](https://www.whonix.org/wiki/Main_Page) (T)
  Anonymous operating system using two virtual machines (Gateway/Workstation) enforcing network isolation, making DNS leaks impossible.
  _best for: Maximum anonymity; Tor-only networking; malware containment; IP leak prevention_

## Wordlist
- [CeWL (T)](https://github.com/digininja/CeWL) (T)
  Ruby-based web spider that generates custom wordlists by crawling target websites to specified depth and extracting unique words for password cracking.
  _best for: Custom wordlist generation; password cracking preparation; web reconnaissance_
- [Cupp (T)](https://github.com/Mebus/cupp) (T)
  Python utility that generates targeted password wordlists by profiling personal information to create customized password candidates for security testing.
  _best for: Password list generation, targeted dictionary attacks, penetration testing_
- [OWASP D4N155 (T)](https://github.com/OWASP/D4N155) (T)
  Intelligent OSINT-based wordlist generator that analyzes website content and metadata to create dynamic, context-aware wordlists for penetration testing.
  _best for: Dynamic wordlist generation from target websites, intelligent password cracking_
- [W Generator](https://app.wgen.io/)
  Frontend-based wordlist generator for penetration testing that creates customized password dictionaries based on publicly available information using language-specific patterns.
  _best for: Custom wordlist generation for password attacks, multi-language targeted wordlists_
- [Paterva / Maltego (T)](https://www.maltego.com/) (R)
  Enterprise-grade OSINT and cyber investigations platform that visualizes relationships between data entities across multiple sources for threat intelligence and incident response.
  _pricing: freemium; best for: Complex OSINT investigations, threat intelligence analysis, relationship mapping_
- [Overview](https://www.overviewdocs.com/) (T)
  Self-hosted document analysis and management platform for investigating large document collections through search, tagging, and plugin-based analysis with full data privacy.
  _best for: Large-scale document analysis, investigative research, institutional document management_
- [Online Nikto scanner](https://nikto.online/) (R)
  Web-based vulnerability scanner that identifies potential security misconfigurations, outdated software, and vulnerabilities in web servers without requiring local installation.
  _pricing: freemium; best for: Web server vulnerability scanning, security assessment, SSL/TLS validation_

# AI Tools
- [AI or Not](https://www.aiornot.com/)
  AI content detection tool that analyzes images and audio to determine whether they were generated by AI or created by humans.
  _pricing: freemium; best for: Detecting AI-generated images and audio in disinformation investigations and media verification_
- [Copyleaks](https://copyleaks.com/) (R)
  Plagiarism and AI-generated content detection platform that checks text against web sources and AI writing patterns across multiple languages.
  _pricing: freemium; best for: Detecting AI-written reports, verifying authenticity of documents, plagiarism analysis_
- [Decopy AI Image Detector](https://decopy.ai/ai-image-detector/)
  AI image detection tool that analyzes photographs and graphics to identify signatures of AI generation from models like Midjourney, DALL-E, and Stable Diffusion.
  _pricing: freemium; best for: Detecting AI-generated profile photos, fake news images, and synthetic media_
- [DeepAI AI Image Detector](https://deepai.org/ai-image-detector)
  DeepAI's image authenticity classifier that detects whether an image was generated by an AI model or captured by a camera.
  _pricing: freemium; best for: AI-generated image detection, media verification in OSINT investigations_
- [DeepSeek](https://www.deepseek.com/)
  Chinese open-source large language model and chat assistant offering competitive reasoning capabilities with free access for research and analysis tasks.
  _pricing: freemium; best for: Document summarization, OSINT data analysis, translation, and pattern identification in collected data_
- [DocMind AI](https://github.com/BjornMelin/docmind-ai-llm) (T)
  Open-source local LLM-powered document analysis tool for querying and summarizing documents using locally running language models via LangChain.
  _best for: Private document analysis, querying sensitive documents without cloud exposure_
- [DuckDuckGo AI Chat](https://duckduckgo.com/aichat)
  Privacy-focused AI chat interface by DuckDuckGo that proxies conversations through multiple LLMs without tying them to user identity or storing them.
  _best for: Privacy-preserving AI assistance for OSINT tasks, anonymous LLM queries_
- [GPTZero](https://gptzero.me/)
  AI text detection tool specifically designed to identify ChatGPT and large language model-generated content with sentence-level granularity.
  _pricing: freemium; best for: Detecting AI-written intelligence reports, academic fraud, and synthetic narrative content_
- [Grammarly AI Detector](https://www.grammarly.com/ai-detector)
  Grammarly's AI content detection tool that identifies text likely generated by AI writing assistants, with percentage breakdown of human vs. AI content.
  _best for: Detecting AI-written content in social media profiles, reports, and messages_
- [Hive AI Generated Content Detection](https://hivemoderation.com/ai-generated-content-detection) (R)
  Enterprise-grade AI content detection API from Hive Moderation that detects AI-generated text, images, and video at scale.
  _pricing: freemium; best for: High-volume AI content detection, bulk media verification in large investigation datasets_
- [Hugging Face AI Detector](https://huggingface.co/spaces/umm-maybe/AI_Detector)
  Community-hosted AI text detector on Hugging Face Spaces that classifies text as AI-generated or human-written using open-source models.
  _best for: Quick AI text classification using open-source models_
- [Illuminarty](https://app.illuminarty.ai/) (R)
  AI image detection tool that identifies AI-generated images and attempts to identify which AI model was used to create them.
  _pricing: freemium; best for: AI image detection with model attribution, deepfake and synthetic media investigation_
- [Microsoft Copilot](https://copilot.microsoft.com/)
  Microsoft's AI assistant powered by GPT-4 with web search integration; useful for summarizing open-source intelligence and conducting research tasks.
  _best for: OSINT data summarization, research assistance, document drafting with web search context_
- [Ollama](https://ollama.com/) (T)
  Local LLM runner that enables privacy-preserving AI inference on personal hardware by downloading and running open-source models like Llama 3, Mistral, and Gemma.
  _best for: Private AI analysis of sensitive OSINT data, local document processing without cloud exposure_
- [OSINT Analyser](https://github.com/joestanding/osint-analyser) (T)
  Open-source OSINT data aggregation and AI analysis tool that collects information from multiple sources and uses LLMs to generate intelligence summaries.
  _best for: Automated OSINT aggregation with AI-powered analysis and reporting_
- [TrueMedia](https://www.truemedia.org/)
  AI deepfake detection platform focused on political content that analyzes videos and images for synthetic media manipulation indicators.
  _best for: Deepfake detection in political and news media contexts_
- [WasItAI](https://wasitai.com/)
  Lightweight AI content detection tool that analyzes text and images to determine if they were created by AI, with a simple interface for quick checks.
  _best for: Quick AI content checks for text and images during media verification_
- [World Monitor](https://www.worldmonitor.app/) (R)
  AI-powered geopolitical event monitoring and intelligence platform that tracks global news and events relevant to national security and business risk.
  _pricing: freemium; best for: Geopolitical OSINT, global event monitoring, early warning intelligence gathering_
- [You.com](https://you.com/) (R)
  AI-powered search engine and assistant that combines web search with LLM-generated responses and source citations for research tasks.
  _pricing: freemium; best for: AI-assisted web research, summarizing search results, multi-source research aggregation_

# Malicious File Analysis

## Search
- [Decalage Malware Search](https://decalage.info/en/mwsearch) (M)
  Custom metasearch engine that indexes malware analysis databases to find malware samples containing specific strings, filenames, hashes, or IOCs.
  _best for: Quick metasearch across multiple malware analysis databases by hash, string, or filename_
- [VirusShare.com](https://virusshare.com/) (R, M)
  Repository of 111+ million live malware samples provided for security researchers, incident responders, forensic analysts, and researchers.
  _best for: Bulk access to malware sample collections for research and analysis_
- [#totalhash](https://totalhash.cymru.com/) (M)
  Malware Hash Registry that searches against 30+ antivirus databases to validate malware hashes with detection percentage results. Updated daily.
  _best for: Hash validation against 30+ AV engines with detection percentages_
- [VX Vault](https://vxvault.net/ViriList.php)
  Active collection of malware samples and related data shared among security researchers and malware analysts for threat intelligence.
  _best for: Access to active malware sample collections_
- [ID Ransomware](https://id-ransomware.malwarehunterteam.com/)
  Free ransomware identification tool that analyzes ransom notes and encrypted file samples to identify variants and provide decryption guidance. Detects 1181+ ransomware types.
  _best for: Ransomware identification and victim support_
- [National Software Reference Library](https://nsrl.hashsets.com/national_software_reference_library1_search.php) (M)
  NIST-maintained repository of cryptographic hash values for known, legitimate software to identify known-good files during digital forensics investigations.
  _best for: Eliminating known-good files in forensic investigations and digital triage_

## Hosted Automated Analysis

### Office Files
- [TYLabs QuickSand Framework](https://scan.tylabs.com/) (T)
  Python-based malware analysis framework for analyzing Office documents and PDFs to identify exploits in decoded streams using YARA signatures.
  _pricing: freemium; best for: Document and PDF malware analysis with exploit detection_
- [JoeSandbox Document Analyzer](https://www.joesandbox.com/)
  Hosted automated malware analysis service that performs dynamic and static analysis of files including Office documents, PDFs, and executables with comprehensive behavioral reporting.
  _pricing: freemium; best for: Comprehensive malware analysis with behavioral insights and threat scoring_

### PDFs
- [TYLabs QuickSand Framework](https://scan.tylabs.com/) (T)
  Python-based malware analysis framework for analyzing Office documents and PDFs to identify exploits in decoded streams using YARA signatures.
  _pricing: freemium; best for: Document and PDF malware analysis with exploit detection_

### Android
- [Akana Android Malware](https://akana.mobiseclab.org/)
  Online Android Interactive Analysis Environment with plugins for analyzing malicious Android applications and APKs for suspicious behavior and malware characteristics.
  _best for: Android app malware analysis and interactive examination_
- [Joe APK Analyzer](https://www.apk-analyzer.net/)
  Part of Joe Sandbox suite; performs dynamic and static analysis of Android Application Packages to detect malicious behavior and generate detailed analysis reports.
  _pricing: freemium; best for: Android malware analysis with dynamic behavior monitoring_
- [VirusTotal](https://www.virustotal.com/gui/) (R)
  Multi-engine file and URL scanner that aggregates results from 70+ antivirus engines and threat feeds.
  _pricing: freemium; best for: Malware analysis, URL reputation, file hash lookups_
- [OPSWAT Meta Defender](https://metadefender.opswat.com/#!/)
  Multi-engine malware scanning service using 20+ antivirus engines with advanced threat analysis, content disarm & reconstruction, and emulation-based detection for zero-day threats.
  _pricing: freemium; best for: Multi-engine malware detection with advanced threat analysis_
- [Hybrid Analysis](https://hybrid-analysis.com/)
  Free automated malware analysis service powered by CrowdStrike Falcon Sandbox. Combines runtime data with memory dump analysis to extract execution pathways and IOCs for evasive malware.
  _pricing: freemium; best for: Advanced malware behavior analysis and evasion detection_
- [Malware Config](https://malwareconfig.com/) (M)
  Database for searching and analyzing extracted malware configurations by hash, domain, or IP address to track C2 infrastructure and malware attributes.
  _best for: Malware configuration extraction and C2 server tracking_
- [MetaDefender](https://metadefender.opswat.com/)
  OPSWAT's cloud-based multi-engine malware scanning platform with advanced threat detection using 30+ antivirus engines, CDR technology, and behavioral analysis.
  _pricing: freemium; best for: Enterprise-grade multi-engine malware detection and advanced threat analysis_
- [Ether](https://ether.gtisc.gatech.edu/web_unpack/)
  Georgia Tech malware analysis framework using Intel VT hardware virtualization for transparent, stealthy malware analysis resistant to anti-analysis techniques.
  _best for: Transparent malware analysis resistant to anti-analysis evasion_
- [Jotti's Malware Scanner](https://virusscan.jotti.org/en-US/scan-file)
  Free multi-scanner malware analysis service that submits files for analysis against 14+ antivirus engines. No installation or account setup required.
  _best for: Quick multi-engine scan without installation or account setup_
- [Valkyrie File Analysis](https://consumer.valkyrie.comodo.com/)
  Cloud-based verdict-driven malware analysis platform from Comodo using static analysis (450+ unpackers), dynamic analysis, and optional human expert analysis for unknown files.
  _pricing: freemium; best for: Advanced malware analysis with human expert review option_
- [detux Linux Sandbox](https://detux.org/) (T)
  Open-source multiplatform Linux sandbox for analyzing Linux malware across multiple CPU architectures (x86, x86-64, ARM, MIPS) using QEMU emulation and traffic analysis.
  _best for: Linux malware analysis across multiple architectures_
- [Joe File Analyzer](https://www.file-analyzer.net/)
  Part of Joe Sandbox suite; performs hybrid code analysis of PE files on Windows with detailed behavioral and system interaction reporting.
  _pricing: freemium; best for: PE file malware analysis with system interaction tracking_
- [Pikker.ee Cuckoo Sandbox](https://sandbox.pikker.ee/)
  Public instance of Cuckoo Sandbox malware analysis system hosted in Estonia. Provides automated dynamic analysis with detailed result reporting for submitted files.
  _best for: Free automated dynamic malware analysis with detailed behavioral reports_
- [Koodous](https://koodous.com)
  Collaborative platform for Android malware research and analysis with community-driven database of 70+ million Android applications with crowd-sourced malware detection.
  _pricing: freemium; best for: Android malware analysis with community collaboration and threat intelligence_
- [Any Run](https://app.any.run/)
  Interactive malware analysis sandbox allowing real-time manual interaction with Windows, macOS, Linux, and Android environments. Fast report generation with MITRE ATT&CK mapping.
  _pricing: freemium; best for: Interactive malware analysis with real-time system interaction_
- [Uncover It](https://www.uncoverit.org/)
  Static malware configuration extractor that quickly analyzes files without execution to extract malware configurations, C2 infrastructure, and IOCs in under 5 seconds.
  _best for: Fast static malware configuration extraction_

## Office Files
- [Office Mal Scanner (T)](https://www.reconstructer.org/)
  Malicious Office document analysis tool for analyzing and reconstructing Office documents to identify exploits and malicious content.
  _best for: Malicious Office document analysis and reconstruction_
- [OffVis (T)](https://download.microsoft.com/download/1/2/7/127ba59a-4fe1-4acd-ba47-513ceef85a85/OffVis.zip) (T)
  Microsoft Office Visualization Tool for analyzing Office binary files to identify exploits and malicious structures. Displays hex and object tree views.
  _best for: Office binary file format analysis and exploit detection_

## PDFs
- [PDF Tools (T)](https://blog.didierstevens.com/programs/pdf-tools/) (T)
  Free suite of PDF analysis tools by Didier Stevens including pdfid (keyword scanning) and pdf-parser.py for analyzing malicious PDF documents and extracting embedded objects.
  _best for: PDF structure analysis and malicious object extraction_
- [Origami Framework (T)](https://code.google.com/archive/p/origami-pdf/) (T)
  Ruby framework for parsing, analyzing, and forging PDF documents. Includes PDF Walker GUI and PDFcop heuristic checker for detecting dangerous PDF content.
  _best for: PDF parsing and manipulation for malicious PDF analysis_

## PCAPs
- [Malware-Traffic-Analysis.net](https://www.malware-traffic-analysis.net/index.html)
  Training resource and PCAP repository providing network traffic captures from malware infections since 2013. Includes tutorials and exercises for malware traffic analysis.
  _best for: Malware network behavior analysis and training exercises_
- [Ghidra (T)](https://github.com/NationalSecurityAgency/ghidra) (T)
  Free and open-source reverse engineering framework from NSA for analyzing compiled software. Includes disassembly, decompilation, scripting, and interactive graphing for malware analysis.
  _best for: Reverse engineering and static malware analysis_
- [Malware Analysis Tools](https://malwareanalysis.tools/)
  Curated resource and reference guide for malware analysis tools with recommendations for virtualization, safety practices, and tool selection for analysis scenarios.
  _best for: Malware analysis tool discovery and best practices reference_
- [virustotal](https://www.virustotal.com/gui/home/upload) (R)
  Free online service that analyzes files and URLs for viruses, trojans and malicious content detected by 70+ antivirus engines and URL/domain reputation services.
  _pricing: freemium; best for: Multi-engine malware scanning and URL reputation lookup_
- Cyber Threat Intelligence (unrecognized node type: None)

# OpSec

## Persona Creation
- [Fake Name Generator](https://www.fakenamegenerator.com/)
  Generates realistic synthetic identities including names, addresses, SSNs, and biographical details for persona creation during OSINT operations.
  _best for: Creating cover personas, sock puppet accounts, test data generation_
- [Fake Identity Generator](https://backgroundchecks.org/justdeleteme/fake-identity-generator/)
  Generates random fake identities including names, addresses, and personal details for use in anonymous account creation and persona testing.
  _best for: Persona creation, anonymous account registration, test data_
- [This Person Does Not Exist](https://thispersondoesnotexist.com/)
  Generates photorealistic AI-synthesized human faces using StyleGAN2; each page load produces a unique, non-existent person’s portrait.
  _best for: Creating realistic profile photos for sock puppet accounts or personas_
- [Random User Generator](https://randomuser.me/) (M)
  Open-source API that generates randomized user profiles including names, photos, addresses, and credentials for development and OSINT persona building.
  _best for: Bulk persona generation, test account data, application seeding_
- [Faker.js](https://cdn.rawgit.com/Marak/faker.js/master/examples/browser/index.html) (T) *(deprecated)*
  JavaScript library for generating massive amounts of fake data including names, addresses, companies, and more; browser demo now hosted at fakerjs.dev.
  _best for: Programmatic fake data generation for application testing and persona data_

## Anonymous Browsing

### TOR
- [Tor Download (T)](https://www.torproject.org/download/) (T)
  Official download page for the Tor Browser and Tor daemon, which route traffic through an encrypted relay network to anonymize origin IP addresses.
  _best for: Anonymous web browsing, accessing .onion sites, circumventing censorship_
- [Freenet Project (T)](https://freenetproject.org/pages/download.html) (T)
  Decentralized, censorship-resistant peer-to-peer network (rebranded Hyphanet) for anonymous file sharing and publishing without central servers.
  _best for: Anonymous file sharing, censorship-resistant publishing, distributed data storage_
- [I2P Anonymous Network (T)](https://geti2p.net/en/) (T)
  Garlic-routing overlay network designed for anonymous internal communications and services, with support for email, torrents, and web browsing.
  _best for: Anonymous internal network communications, darknet service hosting, peer-to-peer privacy_

### Anonymous VPNs
- [VPN Comparisons - That One Privacy Site](https://thatoneprivacysite.net/) *(deprecated)*
  Comprehensive VPN and email provider comparison charts evaluating privacy policies, jurisdiction, logging, and security features; original site no longer active.
  _best for: Comparing VPN providers for anonymity operations_

### Spoof User-Agent
- [UserAgentString.com](https://www.useragentstring.com/pages/useragentstring.php)
  Database of known user agent strings for browsers, bots, and devices; helps identify what browser/OS a user agent string represents or find strings to spoof.
  _best for: Identifying user agent strings, finding UA strings to use for spoofing_
- [WhatIsMyBrowser.com](https://www.whatismybrowser.com/)
  Detects and reports your current browser, operating system, and plugins as seen by websites; useful for verifying anonymization and user-agent spoofing effectiveness.
  _best for: Verifying browser fingerprint and user-agent visibility during OSINT sessions_
- [User Agent String Decoder](https://tools.tracemyip.org/user-agent-string-decoder/) (M)
  Parses and decodes user agent strings into human-readable browser, OS, and device information components.
  _best for: Parsing raw UA strings from logs, understanding browser fingerprint components_

### VPN Tests
- [IP / DNS Leak Detection](https://ipleak.net/)
  Comprehensive leak detection tool that tests for IP, DNS, WebRTC, and IPv6 leaks to verify VPN or Tor anonymization is working correctly.
  _best for: Verifying VPN effectiveness, detecting IP and DNS leaks before OSINT operations_
- [JonDonym](https://ip-check.info/?lang=en)
  Anonymization verification tool from the JonDonym project that checks IP, browser headers, cookies, and other identifiers for privacy leaks.
  _best for: Comprehensive anonymization verification, browser privacy audit_
- [DNS leak test](https://www.dnsleaktest.com/)
  Tests whether DNS queries are leaking outside a VPN tunnel by checking which DNS servers resolve your lookups, potentially exposing your ISP.
  _best for: Verifying DNS query routing through VPN, detecting ISP DNS exposure_
- [DNS Leak Tests](https://dnsleak.com/)
  Alternative DNS leak testing service that identifies whether DNS requests bypass your VPN tunnel and expose your real ISP’s DNS servers.
  _best for: Secondary DNS leak verification, cross-checking VPN DNS configuration_
- [IPv6 Leak Tests](https://ipv6leak.com/)
  Tests whether IPv6 connectivity is leaking your real IP address outside a VPN tunnel that only routes IPv4 traffic.
  _best for: Detecting IPv6 leaks through IPv4-only VPNs, dual-stack network verification_
- [Email Leak Tests](https://emailipleak.com/)
  Tests whether your email client or webmail service leaks your real IP address in email headers when sending messages.
  _best for: Verifying email IP privacy, testing anonymous email service configurations_
- [Perfect Privacy](https://www.perfect-privacy.com/check-ip/)
  IP and anonymization check tool from the Perfect Privacy VPN service that verifies visible IP, DNS servers, and WebRTC status.
  _best for: Pre-operation anonymization verification, IP and DNS leak check_
- [WebRTC Leak Test](https://www.perfect-privacy.com/webrtc-leaktest/)
  Tests whether WebRTC is exposing your real IP address even when using a VPN, as WebRTC can bypass VPN tunnels and reveal local and public IPs.
  _best for: Detecting WebRTC IP leaks in browsers, verifying WebRTC disable effectiveness_
- [LetMeCheck.it](https://letmecheck.it/)
  Multi-protocol anonymization test that checks IP, DNS, WebRTC, and browser fingerprinting for VPN and proxy users.
  _best for: Comprehensive pre-operation anonymization check covering multiple leak vectors_
- [Trace My IP](https://www.tracemyip.org/)
  IP address lookup and geolocation tool that reveals current IP, ISP, location, and additional network metadata visible to websites.
  _best for: Verifying visible IP and geolocation before OSINT operations_

### Browser Tests
- [Browser Statistics](https://www.w3schools.com/browsers/default.asp)
  W3Schools browser market share statistics showing usage distribution across browser types and versions to help craft believable user agent strings.
  _best for: Selecting realistic browser user agents, understanding browser fingerprint believability_
- [WhatsMyBrowser.org](https://www.whatsmybrowser.org/)
  Identifies your current browser version and settings, providing a shareable link that displays your full browser fingerprint to others.
  _best for: Verifying browser fingerprint, checking what browser version appears to websites_
- [What browser am I using.co](https://www.whatbrowseramiusing.co/)
  Simple browser detection page that identifies your current browser name, version, and operating system.
  _best for: Quick browser identification check during anonymization setup_
- [What Browser?](https://whatbrowser.org/)
  Browser detection service that identifies your browser and offers guidance on updating to current versions; useful for fingerprint verification.
  _best for: Browser version verification, fingerprint audit during OSINT setup_

### Proxy Tests
- [IP2Proxy](https://www.ip2proxy.com/) (M)
  Database and lookup service that detects whether an IP address belongs to a proxy, VPN, Tor exit node, or hosting provider to assess anonymization visibility.
  _pricing: freemium; best for: Checking if your VPN/proxy IP is flagged, verifying anonymization infrastructure quality_
- [NoScript (T)](https://noscript.net/) (T)
  Firefox/Chrome security extension that blocks JavaScript, Java, Flash, and other active content by default to prevent browser fingerprinting and code execution from untrusted sites.
  _best for: Browser hardening, preventing JavaScript-based fingerprinting and tracking during OSINT_
- [Firefox-debloat](https://github.com/amq/firefox-debloat) (T)
  Collection of Firefox configuration tweaks and policies to disable telemetry, enhance privacy, and reduce browser fingerprinting surface.
  _best for: Hardening Firefox for OSINT operations, reducing browser telemetry and tracking_
- [Browser Leaks](https://browserleaks.com/)
  Comprehensive browser privacy and security testing suite covering IP, DNS, WebRTC, canvas fingerprinting, font enumeration, and dozens of other browser data leakage vectors.
  _best for: Deep browser fingerprint analysis, identifying all data leak vectors before OSINT operations_
- [Self-Destructing Cookies (T)](https://addons.mozilla.org/en-US/firefox/addon/self-destructing-cookies/) (T)
  Firefox extension that automatically deletes cookies when a tab is closed to prevent persistent tracking; functionality now largely covered by Firefox’s built-in Enhanced Tracking Protection.
  _best for: Automatic cookie cleanup to prevent cross-session tracking_
- [BrowserSpy.dk](https://browserspy.dk/)
  Danish browser information and fingerprinting test site that reveals detailed browser capabilities including plugins, fonts, screen properties, and other identifiers.
  _best for: Detailed browser fingerprint inventory, identifying what data is visible to websites_
- [LocaBrowser.com](https://www.locabrowser.com/)
  Browser geolocation testing tool that checks what location data your browser exposes via the HTML5 Geolocation API to websites.
  _best for: Testing browser geolocation exposure, verifying location permission settings_

## Privacy / Clean Up
- [Privacy Guides](https://www.privacyguides.org/en/)
  Community-maintained guide recommending privacy-respecting software, services, and best practices; covers VPNs, browsers, operating systems, email, and more.
  _best for: Selecting privacy tools, building an OSINT operational security toolkit_
- [Just Delete Me](https://backgroundchecks.org/justdeleteme/)
  Directory of direct links to account deletion pages for hundreds of online services, rated by deletion difficulty to help with digital footprint removal.
  _best for: Removing digital footprint, deleting OSINT research accounts, cleaning up persona accounts_
- [OptOut Credit Prescreen](https://www.optoutprescreen.com/?rf=t)
  Official US consumer opt-out service operated by major credit bureaus to remove yourself from pre-screened credit and insurance offer lists.
  _best for: Reducing data broker exposure, removing from credit prescreening lists_
- [Credit Freeze](https://inteltechniques.com/blog/2018/09/28/complete-credit-freeze-tutorial-update/)
  Intel Techniques tutorial covering the complete process for freezing credit at all major and specialty bureaus to prevent identity theft and data broker access.
  _best for: Protecting personal identity, hardening against identity theft, reducing data broker profiles_
- [Fake US Identities](https://xdd2.org/)
  Generates fake US identity data including names, addresses, SSNs, and driver’s license numbers for test and persona creation purposes.
  _best for: Generating synthetic US identity data for persona creation and testing_
- [Social Media Fingerprint](https://robinlinus.github.io/socialmedia-leak/)
  Browser-based tool that detects which social media platforms you are currently logged into by exploiting cross-origin image loading timing differences.
  _best for: Checking social media session exposure, verifying browser compartmentalization effectiveness_
- [Privacy Tools](https://www.privacytools.io/)
  Privacy-focused tool recommendation site covering encrypted messaging, VPNs, browsers, operating systems, and email providers; now largely redirects to Privacy Guides.
  _best for: Privacy tool discovery, OPSEC toolkit building_
- [Panopticlick](https://panopticlick.eff.org/)
  EFF browser fingerprinting test (now Cover Your Tracks at coveryourtracks.eff.org) that measures how uniquely identifiable your browser is across the web.
  _best for: Measuring browser fingerprint uniqueness, testing tracker blocking effectiveness_
- [Intel Techniques - Hiding from the Internet](https://inteltechniques.com/data/workbook.pdf)
  Michael Bazzell’s OSINT workbook covering comprehensive personal data removal, digital footprint reduction, and operational security techniques.
  _best for: Personal OPSEC hardening, digital footprint removal, data broker opt-outs_
- [The Many Hats Club - Privacy Resources](https://themanyhats.club/centralised-place-for-privacy-resources/)
  Curated community resource list from The Many Hats Club security community aggregating privacy tools, guides, and operational security resources.
  _best for: Discovering community-vetted privacy and OPSEC resources_
- [The Hitchhiker’s Guide to Online Anonymity](https://anonymousplanet.org/guide/)
  Comprehensive, community-maintained guide to online anonymity covering threat modeling, Tor, VMs, operational security, and plausible deniability techniques.
  _best for: Deep OPSEC education, building anonymized OSINT infrastructure, threat modeling_
- [Awesome Opt-Out Guide 2026](https://github.com/thumpersecure/opt-out-manual-2026)
  Community GitHub repository compiling data broker opt-out procedures, privacy request templates, and removal links for 2026.
  _best for: Data broker removal, comprehensive opt-out across multiple platforms and services_

## Metadata / Style
- [Anonymouth - Document Anonymization (T)](https://github.com/psal/anonymouth) (T)
  Java-based authorship anonymization tool that analyzes and modifies writing style features to reduce stylometric identification of document authors.
  _best for: Anonymizing written documents, reducing authorship attribution risk in sensitive reports_
- [MAT2 (T)](https://0xacab.org/jvoisin/mat2) (T)
  Metadata Anonymisation Toolkit v2 — command-line tool that strips metadata from documents, images, audio files, and archives before sharing to prevent inadvertent disclosure.
  _best for: Removing EXIF/metadata from files before publication, cleaning documents prior to evidence submission or sharing_

# Documentation / Evidence Capture

## Web Browsing
- [Forensic OSINT (T)](https://www.forensicosint.com/) (T)
  Chrome extension for full-page web capture with evidence preservation; timestamps and disclosure-ready exports for legal investigations.
  _best for: Evidence capture, legal documentation, case-level review_
- [Fiddler (T)](https://www.telerik.com/download/fiddler) (T, R)
  Web debugging proxy that monitors, inspects, and logs HTTPS/WebSocket traffic between a computer and the internet for analysis.
  _pricing: freemium; best for: Network traffic analysis, web debugging, protocol inspection_
- [Burp Suite (T)](https://portswigger.net/burp/download.html) (T, R)
  Integrated web application security testing platform with proxy, scanner, and manual testing tools for vulnerability assessment.
  _pricing: freemium; best for: Web application security testing, vulnerability discovery, traffic analysis_
- [Page2Images (T)](https://www.page2images.com/URL-Live-Website-Screenshot-Generator) (M)
  Website screenshot and full-page capture API that converts URLs to images for various devices including desktop, mobile, and tablet.
  _pricing: freemium; best for: Website documentation, responsive testing, visual archiving_
- [Archive.is](https://archive.is/) (M)
  Web archiving service that creates instant permanent snapshots of webpages as they appear at capture time.
  _best for: Web archiving, evidence preservation, historical snapshots_
- [Web Page Saver](https://www.magnetforensics.com/resources/web-page-saver/) (T)
  Browser extension for saving complete webpages as single HTML files for offline access and evidence preservation.
  _best for: Document preservation, offline access, evidence capture_
- [Snapper (T)](https://github.com/dxa4481/Snapper) (T)
  Open-source Linux-based tool for automated batch website screenshotting and file capture across multiple hosts.
  _best for: Batch website screenshots, post-reconnaissance documentation_
- [Full Page Screen Capture Chrome Extension (T)](https://github.com/mrcoles/full-page-screen-capture-chrome-extension) (T)
  Chrome extension for one-click full-page screenshot capture of entire scrollable page content.
  _best for: Full-page documentation, scrollable content capture, visual evidence_
- [EZR OSINT Sidebar (T)](https://chromewebstore.google.com/detail/ezr-osint-sidebar/joagbbgciboooipadijeaoidjjigdmof) (T)
  Chrome extension providing integrated OSINT tools in a browser sidebar; extracts and documents images, emails, IPs, and metadata from web content.
  _best for: OSINT data extraction, metadata analysis, investigation documentation_

## Screen Capture
- [FRAPS (T)](https://fraps.com/) (T) *(deprecated)*
  Video recording and screen capture utility for Windows with FPS benchmarking and lossless video capture; last updated 2013 but still functional.
  _pricing: freemium; best for: Video game documentation, screen recording, FPS benchmarking_
- [ShareX (T)](https://getsharex.com/) (T)
  Free and open-source screenshot and screen recording tool for Windows supporting 80+ upload destinations and extensive automation workflows.
  _best for: Screenshot documentation, screen recording, quick sharing_
- [Greenshot (T)](https://getgreenshot.org/) (T)
  Free and open-source screenshot program for Windows and macOS with annotation, highlighting, and multi-format export capabilities.
  _best for: Screenshot capture, annotation, web page documentation_

## Map Locations
- [Google Street View - Hyperlapse](https://github.com/TeehanLax/Hyperlapse.js)
  Tool for creating timelapse and hyperlapse videos from Google Street View images along selected routes for geographic visualization.
  _best for: Route documentation, geographic visualization, temporal narrative_
- [ZeeMaps](https://www.zeemaps.com/) (R)
  Interactive map creation and sharing tool with unlimited markers, 3-level access control, and support for crowdsourced data input.
  _pricing: paid; best for: Location mapping, investigation visualization, crowdsourced data collection_
- [Timeline JS3](https://timeline.knightlab.com/) (T)
  Open-source JavaScript timeline tool by Knight Lab that creates interactive multimedia timelines from Google Sheets or JSON data.
  _best for: Event documentation, chronological narrative, historical timeline creation_

# Training

## Games
- [GeoGuesser](https://www.geoguessr.com/) (R)
  Geography game for geolocation OSINT training; users observe visual clues in Street View panoramas to guess locations worldwide.
  _pricing: freemium; best for: Geolocation skills, visual intelligence analysis, landmark identification_
- [Verif!cation Quiz Bot](https://x.com/quiztime) (R)
  Daily OSINT verification challenges posted on X (Twitter), using a community-driven quiz format for image geolocation and source verification.
  _best for: Community OSINT challenges, image verification techniques, collaborative research_
- [Forensic OSINT KB Guides](https://www.forensicosint.com/osint-guide) (R)
  Knowledge base of digital forensics guides for evidence capture and court-admissible documentation, including web capture and metadata analysis.
  _pricing: freemium; best for: Digital evidence preservation, chain-of-custody documentation, court-ready OSINT reporting_
- [Open Source Intelligence Techniques](https://inteltechniques.com/) (R)
  Professional OSINT training and certification by IntelTechniques with extensive video modules, documentation, and practical investigative exercises.
  _pricing: paid; best for: Professional OSINT certification, structured curriculum, advanced investigative techniques_
- [Plessas](https://plessas.net/online-training) (R)
  Expert-led OSINT training courses by Plessas Experts Network, from fundamentals to intensive hands-on investigation programs.
  _pricing: paid; best for: Professional investigative training, corporate intelligence, legal and compliance investigations_
- [The OSINTion](https://www.theosintion.com/courses) (R)
  Affordable OSINT training courses by Joe Gray, including people OSINT, business investigations, and blockchain-focused instruction.
  _pricing: paid; best for: Accessible OSINT courses, CTF-style learning, people and business intelligence workflows_
- [Smart Questions](https://www.catb.org/esr/faqs/smart-questions.html)
  Foundational guide by Eric S. Raymond on asking effective technical questions in open-source and technical communities.
  _best for: Research methodology, effective questioning, and stronger information-seeking habits_

---

**Total tool/resource entries: 1105**

Top-level categories (33): Username, Email Address, Domain Name, Cloud Infrastructure, IP & MAC Address, Images / Videos / Docs, Social Networks, Instant Messaging, People Search Engines, Dating, Telephone Numbers, Public Records, Compliance & Risk Intelligence, Business Records, Transportation, Geolocation Tools / Maps, Search Engines, Online Communities, Archives, Language Translation, Mobile OSINT, Dark Web, Disinformation & Media Verification, Blockchain & Cryptocurrency, Classifieds, Encoding / Decoding, Tools, AI Tools, Malicious File Analysis, Cyber Threat Intelligence, OpSec, Documentation / Evidence Capture, Training