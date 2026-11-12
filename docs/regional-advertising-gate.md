# Regional advertising activation gate

The optional OneTrust web CMP adapter and the existing Google Privacy & Messaging adapter are mutually exclusive. Both configuration values are null in the shipped application, and the separate advertising flag remains off.

To review a future OneTrust pilot, provision the certified web CMP as a separately authorized deployment with the approved TCF policy version. Confirm that its TCF API responds for visitors outside the GDPR scope. The application requires an explicit non-applicable response from the approved CMP. The EEA, UK and Switzerland continue through the existing affirmative TCF vendor and purpose checks.

For the US, Canada, Australia and New Zealand, use CMP-managed geolocation with an explicit allowlist of reviewed subdivisions. Assign a dedicated default-off, opt-in Google advertising category to each approved market, disclose the actual purposes and vendors, and verify that dismissing the notice or opting out does not activate that group. Confirm the actual provider's location response and that the preference center can withdraw consent and emit the subscribed events. Test consent expiry and cross-region changes before approving a profile. Keep each unreviewed subdivision absent from the configuration.

The US path additionally needs an approved GPP CMP ID, GPP 1.1 ready state, and the applicable US National section containing the three explicit no-opt-out values. The pilot declines requests after opt-outs and recognizes Global Privacy Control. Review the CMP's GPP section mapping and state-level rules with the owner before authorizing serving. The other three countries require the affirmative regional choice and separate jurisdiction review. This adapter does not treat the Canadian GPP section as an AdSense grant.

The approved publisher account, publisher and unit IDs, applicable disclosures, real CMP credentials and live geographic and creative checks are separate activation gates. Browser fixtures exercise the API contract without contacting any CMP or ad provider.

- [Google-certified CMP list](https://support.google.com/adsense/answer/13554116)
- [AdSense GPP support](https://support.google.com/adsense/answer/14126816)
- [IAB TCF browser API](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md)
- [IAB GPP browser API](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Core/CMP%20API%20Specification.md)
- [OneTrust web methods](https://developer.onetrust.com/onetrust/docs/javascript-api) and [consent events](https://developer.onetrust.com/onetrust/docs/javascript-events-guide)
- [Canadian OPC behavioural advertising guidance](https://www.priv.gc.ca/en/privacy-topics/technology/online-privacy-tracking-cookies/tracking-and-ads/gl_ba_1112/)
- [Australian OAIC guidance](https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/organisations/tracking-pixels-and-privacy-obligations) and [New Zealand OPC privacy principles](https://www.privacy.org.nz/resources-and-learning/knowledge-base/view/376/)
