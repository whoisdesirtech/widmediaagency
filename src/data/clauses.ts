export interface Clause {
  id: string;
  number: number;
  title: string;
  content: string;
  category: 'core' | 'added' | 'role-specific';
  isNeverChange: boolean;
}

export const FIXED_CLAUSES: Clause[] = [
  {
    id: 'independent-contractor-status',
    number: 1,
    title: 'Independent Contractor Status',
    content: `The Contractor is an independent contractor and not an employee, partner, or agent of the Agency. The Contractor retains full control over the manner, method, and means of performing the services. The Agency controls only the result to be achieved. The Contractor is responsible for all taxes, insurance, and benefits. The Contractor shall not be entitled to any employee benefits, including but not limited to health insurance, retirement benefits, or paid time off.\n\nThe Contractor acknowledges that misclassification of workers carries significant legal risk for both parties and agrees to maintain documentation supporting independent contractor status, including a valid W-9 (domestic) or W-8BEN (international) form on file with the Agency.\n\nATTORNEY REVIEW NOTE: Worker classification laws vary by jurisdiction. An attorney must confirm that this classification is appropriate for the Contractor's jurisdiction and circumstances.`,
    category: 'core',
    isNeverChange: true,
  },
  {
    id: 'scope-of-services',
    number: 2,
    title: 'Scope of Services',
    content: `The specific scope, deliverables, timelines, and compensation for each engagement shall be defined in a separate Statement of Work ("SOW") executed by both parties. Each SOW is incorporated into this Master Agreement by reference. The Contractor shall perform services as described in the applicable SOW(s) and shall not expand the scope without written authorization from the Agency.\n\nThis Master Agreement governs the overall relationship; individual SOWs govern specific project terms. In the event of conflict between this Master Agreement and a SOW, the Master Agreement shall control on matters of legal significance (ownership, confidentiality, indemnification, termination) and the SOW shall control on project-specific terms (deliverables, timelines, compensation).`,
    category: 'core',
    isNeverChange: true,
  },
  {
    id: 'compensation',
    number: 3,
    title: 'Compensation & Payment',
    content: `Compensation for each engagement shall be specified in the applicable SOW. Payment terms start on invoice receipt by the Agency. Unless otherwise specified in the SOW, the Agency shall remit payment within the payment schedule defined therein.\n\nContractor pay is contingent upon the Agency receiving payment from the client for the applicable project, unless the SOW explicitly states otherwise. The Agency shall make commercially reasonable efforts to collect client payment promptly.\n\nIf the Agency fails to remit payment within the timeframe specified in the SOW, the Contractor may: (a) assess interest at 1.5% per month on the outstanding balance; (b) issue a written demand for payment; or (c) after 30 days of non-payment, pause work on the affected project(s) until payment is received, without liability for deadline extensions.\n\nATTORNEY REVIEW NOTE: Late-payment provisions and interest rates must comply with applicable state usury laws. An attorney must confirm enforceability in the governing jurisdiction.`,
    category: 'core',
    isNeverChange: true,
  },
  {
    id: 'deliverables',
    number: 4,
    title: 'Deliverables & Revisions',
    content: `All deliverables shall be specified in the applicable SOW. Deliverables are considered accepted upon client approval or five (5) business days after delivery without written rejection. The Contractor shall provide the number of revision rounds specified in the SOW. Additional revisions beyond the agreed scope shall be billed at the Contractor's then-current hourly rate as specified in the SOW.\n\nAll deliverables must be provided in the formats specified in the SOW. The Contractor shall maintain backup copies of all project files for a minimum of sixty (60) days after final delivery.`,
    category: 'core',
    isNeverChange: false,
  },
  {
    id: 'ownership-ip',
    number: 5,
    title: 'Ownership & Intellectual Property Assignment',
    content: `All intellectual property, including but not limited to photographs, videos, designs, code, copy, graphics, and other creative works (the "Work Product"), created by the Contractor in the scope of any SOW shall become the exclusive property of the Agency upon full payment of the applicable SOW.\n\nThe Agency receives full ownership of all Work Product, including copyright, trademark, and any other intellectual property rights, for use without limitation in any medium. The Contractor retains no rights to the Work Product after assignment, except as expressly carved out below.\n\nPre-Existing Materials: The Contractor retains ownership of pre-existing tools, prompt libraries, code libraries, templates, and methodologies ("Contractor Tools") used in creating Work Product. The Contractor grants the Agency a perpetual, irrevocable, royalty-free license to use Contractor Tools incorporated into Work Product, solely as part of the delivered Work Product.\n\nAI Work: For AI-generated or AI-assisted deliverables, API keys and paid subscriptions shall be Agency-provided or clearly designated as contractor-provided-and-reimbursed in the SOW. Upon termination, all API keys, subscription credentials, and access to AI tools used for Agency projects shall be transferred to the Agency or confirmed deleted from the Contractor's systems.\n\nATTORNEY REVIEW NOTE: IP assignment language must be reviewed for jurisdiction-specific requirements. Some jurisdictions require explicit copyright assignment documentation separate from this agreement.`,
    category: 'core',
    isNeverChange: true,
  },
  {
    id: 'confidentiality',
    number: 6,
    title: 'Confidentiality & Data Security',
    content: `The Contractor shall maintain strict confidentiality of all non-public information disclosed by the Agency, its clients, or obtained during the course of any engagement. This obligation survives indefinitely for trade secrets and for five (5) years for other confidential information after termination of the applicable SOW.\n\nThe Contractor shall: (a) not disclose confidential information to any third party without prior written consent; (b) use confidential information solely for performing the applicable SOW; (c) secure all passwords, API keys, CRM credentials, client data, and access credentials using industry-standard encryption or password management tools; (d) upon completion of a project or termination, securely delete or transfer all Agency and client data from personal devices, drives, and accounts within five (5) business days, and provide written confirmation of deletion.\n\nThis duty of confidentiality applies to all client identities, project details, business strategies, pricing, and any other information not generally known to the public.\n\nATTORNEY REVIEW NOTE: Confidentiality obligations and their duration must be reviewed for enforceability under applicable state law. Some states limit the duration and scope of post-termination confidentiality obligations.`,
    category: 'core',
    isNeverChange: true,
  },
  {
    id: 'non-solicitation',
    number: 7,
    title: 'Client Protection & Non-Solicitation',
    content: `During the term of this Agreement and for twelve (12) months following the completion of the Contractor's last active SOW, the Contractor shall not directly or indirectly solicit, contact, or offer services to any client of the Agency to whom the Contractor was introduced through or in connection with Agency engagements ("Introduced Clients").\n\nThe twelve-month restricted period runs from the completion date of each individual SOW with respect to clients introduced during that SOW, or from the date of the Contractor's last active engagement with the Agency, whichever is later.\n\nThe Contractor shall not directly invoice, contract with, or accept payment from Introduced Clients for services that fall within the scope of services offered by the Agency, unless the Contractor first obtains written consent from the Agency.\n\nViolation of this clause shall result in: (a) forfeiture of any unpaid compensation related to the project during which the violation occurred; and (b) liquidated damages equal to the greater of $5,000 or the annual value of the solicited client relationship, in addition to any other remedies available at law or equity.\n\nATTORNEY REVIEW NOTE: Non-solicitation and non-compete provisions are limited or void in certain U.S. states (e.g., California, North Dakota, Oklahoma, Minnesota). Enforceability depends on the Contractor's jurisdiction. An attorney must confirm enforceability.`,
    category: 'core',
    isNeverChange: true,
  },
  {
    id: 'portfolio-use',
    number: 8,
    title: 'Portfolio & Marketing Use',
    content: `The Agency may use the Contractor's name, likeness, and general project descriptions (excluding confidential client information) in its marketing materials, portfolio, and website to showcase the Agency's capabilities. The Contractor may reference the general nature of work performed for the Agency in their own portfolio, but shall not disclose confidential client information or proprietary methodologies.\n\nEither party may terminate this portfolio-use license with thirty (30) days written notice.`,
    category: 'core',
    isNeverChange: false,
  },
  {
    id: 'equipment',
    number: 9,
    title: 'Equipment & Software',
    content: `Unless otherwise specified in the SOW, the Contractor shall provide their own equipment, tools, and software necessary to perform the services. The Agency shall not be responsible for any equipment costs, software licenses, or subscription fees incurred by the Contractor.\n\nFor projects requiring specific equipment or software (as identified in the SOW), the SOW shall specify whether the Agency will provide, reimburse, or require the Contractor to supply such resources.\n\nFor roles requiring liability insurance (videographers, drone operators, on-location photographers, and similar), the Contractor must maintain adequate liability insurance coverage and provide proof of coverage upon request.`,
    category: 'core',
    isNeverChange: false,
  },
  {
    id: 'deadlines-timelines',
    number: 10,
    title: 'Deadlines & Communication',
    content: `The Contractor shall meet all deadlines specified in the applicable SOW. If the Contractor anticipates a delay, they must notify the Agency in writing at least twenty-four (24) hours before the deadline, provide a revised timeline, and propose a mitigation plan.\n\nStandard communication response time is within twenty-four (24) business hours. For urgent matters, the response time is two (2) to four (4) hours during business hours. The Agency and Contractor shall agree on primary communication channels (e.g., Slack, email, ClickUp) as specified in the SOW or onboarding documentation.\n\nFailure to communicate delays or meet revised deadlines may result in project reassignment and applicable deductions from compensation as specified in the SOW.`,
    category: 'core',
    isNeverChange: false,
  },
  {
    id: 'termination',
    number: 11,
    title: 'Termination',
    content: `Standard Termination: Either party may terminate a SOW with fourteen (14) days written notice. In the event of standard termination, the Contractor shall be compensated for all work completed and approved up to the termination date, calculated on a pro-rata basis.\n\nImmediate Termination for Cause: The Agency may terminate immediately and without notice for: (a) material breach of confidentiality; (b) direct solicitation or poaching of Agency clients; (c) misrepresentation of qualifications or credentials; (d) illegal activity; or (e) conduct that materially damages the Agency's reputation or client relationships. In the event of immediate termination for cause, the Contractor forfeits all unpaid compensation related to the terminated engagement.\n\nFile & Credential Handover: Upon termination for any reason, the Contractor shall, within five (5) business days: (a) transfer all project files, assets, and deliverables (completed and in-progress) via the agreed cloud platform; (b) return all Agency credentials, API keys, and access tokens; (c) confirm deletion of all Agency and client data from personal devices and accounts; (d) provide a written certification that no Agency materials remain in the Contractor's possession.\n\nATTORNEY REVIEW NOTE: Termination provisions, including forfeiture of pay, must comply with applicable wage and labor laws. An attorney must confirm enforceability.`,
    category: 'core',
    isNeverChange: true,
  },
  {
    id: 'indemnification',
    number: 12,
    title: 'Indemnification',
    content: `Each party shall indemnify, defend, and hold harmless the other party from and against any claims, damages, losses, and expenses (including reasonable attorneys' fees) arising from: (a) the indemnifying party's breach of this Agreement; (b) the indemnifying party's negligence or willful misconduct; or (c) any claim that the Work Product or materials provided by the indemnifying party infringe upon a third party's intellectual property rights.\n\nThe Contractor shall maintain adequate professional liability insurance for the duration of any engagement, with coverage limits appropriate to the scope of work, and shall provide proof of insurance upon the Agency's request.\n\nATTORNEY REVIEW NOTE: Indemnification scope and insurance requirements must be reviewed for adequacy and enforceability under applicable law.`,
    category: 'core',
    isNeverChange: true,
  },
  {
    id: 'governing-law',
    number: 13,
    title: 'Governing Law & Jurisdiction',
    content: `This Agreement shall be governed by and construed in accordance with the laws of the Agency's home jurisdiction as specified in the Agency settings, without regard to its conflict-of-laws principles.\n\nAny dispute arising under this Agreement shall first be submitted to mediation. If mediation fails within thirty (30) days, the dispute shall be resolved through binding arbitration administered under the rules of the American Arbitration Association, with the arbitration taking place in the Agency's home jurisdiction. The prevailing party shall be entitled to recover reasonable attorneys' fees and costs.\n\nATTORNEY REVIEW NOTE: Jurisdiction-specific provisions must be confirmed by an attorney. International contractors may be subject to different dispute resolution frameworks.`,
    category: 'core',
    isNeverChange: true,
  },
  {
    id: 'entire-agreement',
    number: 14,
    title: 'Entire Agreement',
    content: `This Master Agreement, together with all executed SOWs and addenda, constitutes the entire agreement between the parties regarding the subject matter herein and supersedes all prior agreements, understandings, representations, and warranties, whether oral or written. No modification of this Agreement shall be effective unless in writing and signed by both parties.\n\nIf any provision of this Agreement is found to be unenforceable, the remaining provisions shall continue in full force and effect. The failure of either party to enforce any provision of this Agreement shall not be construed as a waiver of such provision or the right to enforce it at a later time.`,
    category: 'core',
    isNeverChange: true,
  },
];

export const ADDED_CLAUSES: Clause[] = [
  {
    id: 'kill-fee',
    number: 15,
    title: 'Kill Fee & Cancellation',
    content: `If the Agency cancels a project after work has commenced, the Contractor shall receive a kill fee calculated as follows:\n\n• Cancellation before 25% completion: 25% of the total SOW fee\n• Cancellation between 25%–50% completion: 50% of the total SOW fee\n• Cancellation between 50%–75% completion: 75% of the total SOW fee\n• Cancellation after 75% completion: 100% of the total SOW fee\n\n"Completion" is measured by the percentage of deliverables completed and submitted relative to the total deliverables specified in the SOW. The kill fee is due within fifteen (15) days of the cancellation notice.\n\nThis kill fee applies only to Agency-initiated cancellations and does not apply to termination for cause by the Agency.`,
    category: 'added',
    isNeverChange: false,
  },
  {
    id: 'late-payment',
    number: 16,
    title: 'Late Payment Consequences',
    content: `If the Agency fails to pay the Contractor within the timeframe specified in the applicable SOW:\n\n1. After the due date: The Agency shall pay interest on the outstanding amount at a rate of 1.5% per month (or the maximum rate permitted by applicable law, whichever is lower).\n2. After fifteen (15) days past due: The Contractor may issue a written demand for payment.\n3. After thirty (30) days past due: The Contractor may pause work on all affected projects until payment is received, without liability for resulting deadline extensions.\n4. After sixty (60) days past due: The Contractor may terminate the affected SOW(s) for cause and retain all work product completed to date.\n\nThe Contractor's right to pause or terminate for non-payment is in addition to, and not in lieu of, any other remedies available at law or in equity.\n\nATTORNEY REVIEW NOTE: Interest rates and late-payment provisions must comply with applicable state usury and wage-payment laws.`,
    category: 'added',
    isNeverChange: false,
  },
  {
    id: 'dispute-resolution',
    number: 17,
    title: 'Dispute Resolution',
    content: `The parties agree to resolve disputes as follows:\n\nStep 1 — Good Faith Negotiation: The parties shall first attempt to resolve any dispute through direct, good-faith negotiation within fifteen (15) days of written notice of the dispute.\n\nStep 2 — Mediation: If negotiation fails, the parties shall submit the dispute to mediation administered by a mutually agreed-upon mediator. The mediation shall take place in the Agency's home jurisdiction. Mediation costs shall be shared equally.\n\nStep 3 — Binding Arbitration: If mediation fails within thirty (30) days, the dispute shall be resolved through binding arbitration under the rules of the American Arbitration Association. The arbitration shall take place in the Agency's home jurisdiction. The arbitrator's decision shall be final and binding.\n\nStep 4 — Litigation: Notwithstanding the above, either party may seek injunctive or equitable relief from a court of competent jurisdiction to prevent irreparable harm, including but not limited to breaches of confidentiality or intellectual property obligations.\n\nThe prevailing party in any dispute resolution proceeding shall be entitled to recover reasonable attorneys' fees and costs.\n\nATTORNEY REVIEW NOTE: The enforceability of arbitration clauses varies by jurisdiction. An attorney must confirm compliance with applicable federal and state arbitration laws.`,
    category: 'added',
    isNeverChange: false,
  },
  {
    id: 'force-majeure',
    number: 18,
    title: 'Illness, Unavailability & Force Majeure',
    content: `Neither party shall be liable for failure to perform its obligations under this Agreement if such failure results from circumstances beyond the party's reasonable control, including but not limited to: natural disasters, pandemics, government actions, war, terrorism, power outages, internet failures, or serious illness or injury.\n\nIf the Contractor becomes unavailable due to illness, emergency, or force majeure:\n1. The Contractor must notify the Agency as soon as reasonably practicable, and in any event within twenty-four (24) hours of becoming aware of the unavailability.\n2. Deadlines for affected deliverables shall be extended by a period equal to the duration of the unavailability, plus a reasonable ramp-up period.\n3. The Agency may, at its discretion, engage replacement talent for the affected work. The original Contractor retains the right to resume work once available, subject to SOW terms and any necessary SOW modifications.\n4. The Contractor shall cooperate in good faith with any replacement talent to ensure continuity, including providing access to project files and status updates.\n\nFor roles requiring specialized equipment or on-location presence (videographers, drone operators, photographers), the Contractor must maintain backup plans and, where feasible, identify qualified substitutes who can fulfill the SOW requirements.`,
    category: 'added',
    isNeverChange: false,
  },
  {
    id: 'immediate-termination',
    number: 19,
    title: 'Immediate Termination for Serious Breach',
    content: `The Agency may terminate this Agreement or any SOW immediately and without prior notice if the Contractor:\n\n(a) Breaches any confidentiality obligation and the breach is not cured within forty-eight (48) hours of written notice;\n(b) Directly solicits, contacts, or accepts work from an Introduced Client in violation of the non-solicitation clause;\n(c) Materially misrepresents qualifications, certifications, licenses, or insurance coverage;\n(d) Engages in illegal activity in connection with any Agency engagement;\n(e) Conducts themselves in a manner that materially damages the Agency's reputation or client relationships;\n(f) Fails to maintain required insurance or professional licenses for roles requiring such coverage.\n\nUpon immediate termination for cause:\n• All unpaid compensation for the terminated engagement is forfeited;\n• All file and credential handover obligations apply immediately;\n• The Agency may pursue all available legal remedies, including liquidated damages under the non-solicitation clause.\n\nThe Contractor retains the right to cure curable breaches where notice and an opportunity to cure are provided.\n\nATTORNEY REVIEW NOTE: Forfeiture of earned wages may violate wage-payment statutes in some jurisdictions. An attorney must confirm compliance with applicable law.`,
    category: 'added',
    isNeverChange: false,
  },
  {
    id: 'file-handover',
    number: 20,
    title: 'File & Credential Handover Protocol',
    content: `Upon termination, completion of a SOW, or upon the Agency's written request, the Contractor shall complete the following handover steps within five (5) business days:\n\n1. Cloud Transfer: Upload all project files, deliverables (completed and in-progress), source files, and raw assets to the Agency's designated cloud storage platform (e.g., Google Drive, Dropbox, or other agreed platform).\n\n2. Credential Return: Return all Agency and client credentials, including but not limited to: login credentials, API keys, tokens, passwords, and access codes. All credentials must be transmitted via secure, encrypted channels.\n\n3. Deletion Confirmation: Delete all Agency and client data from personal devices, drives, accounts, and backup systems. Provide written confirmation of deletion, signed under penalty of perjury where applicable.\n\n4. Nothing Retained: Confirm in writing that no Agency or client materials, copies, or derivatives remain in the Contractor's possession or control.\n\n5. Subscription Transfer: For paid subscriptions, tools, or services funded by the Agency, transfer ownership or provide credentials for Agency account takeover.\n\nFailure to complete handover within the specified timeframe may result in withholding of final payment and/or legal action to compel compliance.`,
    category: 'added',
    isNeverChange: false,
  },
];
