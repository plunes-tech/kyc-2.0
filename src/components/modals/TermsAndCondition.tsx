import { Button, Checkbox, TextInput } from "@mantine/core";
import React, { useState } from "react";
import { Hospital } from "../../features/hospital/types";
import { SubFeeIcon } from "../../assets/icons";
import { notifications } from "@mantine/notifications";
import ViewDocModal from "./ViewDocModal";

const TermsAndCondition: React.FC<{
        postData: Hospital, 
        setPostData: React.Dispatch<React.SetStateAction<Hospital>>, 
        setOpenDetailsModal: React.Dispatch<React.SetStateAction<boolean>>,
        setOpenTermsCondition: React.Dispatch<React.SetStateAction<boolean>>,
    }> = ({postData, setPostData, setOpenDetailsModal, setOpenTermsCondition}) => {

    const [docUrl, setDocUrl] = useState("")
    const [termsChecked, setTermsChecked] = useState(false)

    const handleNext = () => {
        if(!postData?.platformSubscriptionFee && postData?.platformSubscriptionFee !== 0) {
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: "Platform subscription fee cannot be empty"
            })
        }
        if(!postData?.hospitalDetails?.representativeName || !postData?.hospitalDetails?.representativeDesignation) {
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: "Please enter representative name and desdignation before proceed"
            })
        }
        if(!termsChecked) {
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: "Please check terms and conditions before proceed"
            })
        }
        setOpenDetailsModal(true)
        setOpenTermsCondition(false)
    }

    return (
        <>
        <>
            <h2 className="text-center font-semibold text-[1rem] mt-2 mb-3">Terms & Condition</h2>
            <div className="text-justify">
                <p className="text-[0.7rem] mb-2.5">
                    We are AWC Technologies Private Limited ('operating under brand names <b> Plunes</b>', &#39;<b>Company</b>&#39;, or &#39;<b>We</b>&#39;), a company registered in India under the 
                    Companies Act, 2013, having the CIN - U74999DL2016PTC304426 and its registered office at 55, 2nd Floor Lane No. 2, West End Marg, Saidulajab, Near Saket Metro Station, 
                    New Delhi - 110030, India.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    We are, <i>inter alia</i>, engaged in the business of (a) providing access to this portal which is a proprietary health technology platform (the '<b>Portal</b>') and other software 
                    solutions to the users of this Portal for hospital information management system. patient management; and (b) insurance claim management. We operate our business and provide the 
                    Services under the brand name of '<b>Plunes</b>&trade;' which is owned and operated by the Company. Any use of or reference to 'Plunes' in this Terms of Use shall mean the business 
                    of the Company conducted under the brand name of '<b>Plunes</b>' including providing the Services.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    We are providing the Services to You in accordance with the Terms of Use set out below and as per the commercial arrangement agreed and accepted by You.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    These Terms of Use constitute a legally binding agreement between You, whether personally or on behalf of an entity (&#39;<b>You</b> &#39;), and the Company, concerning your access to 
                    and use of the Services. You agree that by accessing the Services, You have read, understood, and agreed to be bound by all of these Terms of Use. If You do not accept all of these 
                    Terms of Use, You are expressly prohibited from using the Services and must cease use immediately.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    We will provide You with prior notice of any scheduled changes to the Services You are using. The modified Terms of Use will become effective upon notifying You from our email, 
                    hospitalsupport@plunes.com, as stated in the email message. By continuing to use the Services after the effective date of any changes, You agree to be bound by the modified terms.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">1. OUR SERVICES</h3>
                <p className="text-[0.7rem] mb-2.5">
                    1.1 The Services provided on the Portal are intended to improve your Hospital Operations and digitization of the patient journey. Our Portal is a cloud based HIMS solution using which you 
                    can get operational intelligence for incremental patient volumes and better business outcomes. Plunes endeavours to improve its Portal users’ patient base via this portal and will help 
                    in streamlining the users’ operations. You will be listed on the Plunes website and the mobile applications, and Plunes will promote You on its application, website.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    1.2 Subject to the agreed commercial arrangement, Plunes is providing You access to the Portal with its functionalities and features, i.e. Cloud based HIMS system, analytics panel, 
                    mobile applications and Digital Payment Accounts.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    List of HIMS Features{" "}<b><a className="text-[#3E97FF] cursor-pointer ml-2" onClick={e => {e.preventDefault(); setDocUrl("/terms-and-condition/HIMS-LIST-OF-FEATURES.pdf")}}><u>View</u></a></b>{" "}
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    1.3 These Terms of Use shall remain in full force and effect while You use the Services. You may terminate your access to the Services by giving to Plunes a sixty (60) days prior 
                    written notice. Similarly, Plunes may terminate your access to the Services by giving You a sixty (60) days prior written notice.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">2. USER REQUIREMENTS FOR USE OF SERVICES</h3>
                <p className="text-[0.7rem] mb-2.5">
                    2.1 You must provide all materials required to educate patients about your facilities, treatment options, standard of care, pricing of procedures etc., to Plunes.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    2.2 You must provide, to Plunes, treatment data, pricing, and related materials for each case on priority within 24 hours of the request made by Plunes.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    2.3 You are required to appoint one (1) point of contact for coordination with Plunes. You must also provide customer care facility.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    2.4 You must, on need basis, share the list of treatments You conduct along with the price and other details as may be reasonably requested by Plunes.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    2.5 You must provide best price to the users of Plunes’ portals and to patients who provide booking ID received from Plunes at the time of booking and/or making payment for the 
                    treatment availed from You.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">3. DIGITAL PAYMENT ACCOUNTS</h3>
                <p className="text-[0.7rem] mb-2.5">
                    3.1 Claim amount will be settled by the insurance company within maximum 30 business days on best effort basis. The period stated in this paragraph will begin from the day all 
                    required claim documents as submitted by You have been duly received by the insurance company and Plunes. The payment of the claim settlement amount will be contingent upon 
                    verification, by Plunes or the insurance company, of the claim documents submitted by You.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    3.2 The payment for settlement of claims will in no way absolve You of your duty to comply with the procedural and documentary requirements necessary for claim processing. 
                    Notwithstanding the payment for settlement of claims under paragraph 3.1, Plunes, with the specific instructions of the insurance company, may determine whether any payment 
                    is appropriate under the circumstances and reserves the right to withhold such payment if Plunes believes there are any discrepancies, inaccuracies, or omissions in the 
                    claim documentation submitted by You.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    3.3 Upon receiving written intimation from Plunes of the rejection or reversal of the claim by the insurance company, You must repay the full amount received against settlement of 
                    claim/s by You for the rejected or reversed claim, to the insurance company within such time period as may be specified by the insurance company in its intimation of 
                    rejection/demand for refund.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    3.4 In the event of a dispute regarding the rejection or reversal of a claim under paragraph 3.3, You agree to cooperate with Plunes in good faith to resolve the 
                    issue with the insurance company.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    3.5 You agree to furnish a No Dues Certificate{" "} <b><a href="https://plunes-data.s3.ap-south-1.amazonaws.com/terms-and-condition/NO-DUES-CERTIFICATE.docx" target="_blank" className="text-[#3E97FF]">(<u>NDC</u>)</a></b>{" "} 
                    to Plunes and the insurance company in the manner prescribed here, to certify that there is no payment due from Plunes or the insurance company to You for patients admitted and processed by 
                    You through Plunes. This NDC must be furnished by You on a quarterly basis. For the purposes of this Terms of Use, a &#39;quarter&#39; means a successive period of three months ending on 
                    30<sup>th</sup> June, 30 <sup>th</sup> September, 31<sup>st</sup> December and 31 <sup>st</sup> March each year.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">4. FEES FOR THE SERVICES</h3>
                <p className="text-[0.7rem] mb-2.5">
                    4.1 By accepting these Terms of Use or continuing to use our
                    Services, You agree to following payment terms: Platform
                    subscription fees is to be entered below:
                </p>
                
                {/* Sub fee here */}
                <div className="flex items-start flex-col border-1 justify-between gap-4 border-[#C1BDBD] w-[max-content] rounded-[0.4rem] py-2 px-3 mb-[1.5rem] sm:flex-row sm:items-center lg:gap-[10rem]">
                    <div className="flex items-center gap-4">
                        <SubFeeIcon className="text-[#00A82E]" />
                        <h4 className="text-[#302F2F] text-[0.8rem] font-semibold m-0">Subscription Fee</h4>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="bg-[#F0F0F0] border-1 border-[#E0E0E0] rounded-[0.3rem] py-[0.25rem] px-[3rem] text-[#302F2F] text-[0.7rem] mr-2">{postData?.platformSubscriptionFee ? postData?.platformSubscriptionFee : "-"}</p>
                        <p className="bg-[#F0F0F0] border-1 border-[#E0E0E0] rounded-[0.3rem] py-[0.25rem] px-[1rem] text-[#3E97FF] text-[0.7rem]">₹</p>
                        <p className="bg-[#F0F0F0] border-1 border-[#E0E0E0] rounded-[0.3rem] py-[0.25rem] px-[1rem] text-[#302F2F] text-[0.7rem]">%</p>
                    </div>
                </div>

                <p className="text-[0.7rem] mb-2.5">
                    4.2 The details regarding the applicable subscription fee, portal fee percentage, and payment methods will be provided to You at the time of subscription which is available in your 
                    profile and may be updated in accordance with our policies.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    4.3 The subscription fee will always be invoiced in full, and You agree that You will have no right to refund in case the subscription is terminated before the end of the month 
                    for which the subscription fee has been paid.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    4.4 If a payment is processed online at the Platform, the same will be adjusted at the time of reconciliation.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    4.5 You must be duly registered and in compliance with all the provisions of goods and service tax, and such other applicable duties, charges, and levies, and 
                    provide all such information to Plunes. You must also comply with all procedural formalities prescribed by the applicable laws and/or statutes for raising the invoice 
                    (including but not limited to uploading the data as regards invoices / any other documents evidencing the payments, in a correct form and in line with the prescribed 
                    law and rules thereunder).
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    4.6 You agree that Plunes has the right to deduct tax deducted at source (TDS) and charge goods and service tax as per applicable laws.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    4.7 Plunes adheres to transparent module of payments, where our partner facilities can easily track the status of the payment in the panels offered to them.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    4.8 Our partner facilities have the complete control in adding the amount, i.e., the price of the service, discount offerings, and also can easily track the status of the payments.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    4.9 We may, from time to time, make changes to the subscription fee and will communicate any price changes to You in advance in accordance with applicable laws.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">5. INTELLECTUAL PROPERTY RIGHTS</h3>
                <p className="text-[0.7rem] mb-2.5">
                    We are the owner of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, 
                    and graphics in the Services, as well as the trademarks, service marks, and logos contained therein (collectively, the &#39;IPR&#39;).
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    The IPR are provided in or through the Services &#39;AS IS&#39; for your internal business purpose only. Any present and future intellectual property rights created during activities under 
                    this Terms of Use will be solely owned by Plunes.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    Any breach of these IPR will constitute a material breach of our Terms of Use and your right to use our Services will terminate immediately.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">6. USER REPRESENTATIONS</h3>
                <p className="text-[0.7rem] mb-2.5">
                    By using the Services, You represent and warrant that: (1) all registration information You have submitted or will submit are true, accurate, current, and complete; (2) You 
                    will maintain the accuracy of such information and promptly update such registration information as necessary; (3) You have the legal capacity and You agree to comply with 
                    these Terms of Use; (4) You will not use the Services for any illegal or unauthorised purpose; and (5) your use of the Services will not violate any applicable laws or regulations.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    If You provide any information that is untrue, inaccurate, not current, or incomplete, We have the right to suspend or terminate your account and refuse any and all current or future 
                    use of the Services (or any portion thereof).
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">7. INDEMNITY</h3>
                <p className="text-[0.7rem] mb-2.5">
                    7.1 You and Plunes agree to defend, indemnify, and hold each other harmless and their officers, directors, employees, and agents from and against any and all liabilities, claims, 
                    suits, losses, damages, costs, fees and expenses (including reasonable attorneys&#39; fees) arising out of or in connection with (a) any non- compliance with applicable laws by 
                    them in performance of their obligations under the Agreement.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    7.2 Plunes will not be held responsible for any medico-legal liability arising from complications in the treatments of patients which is conducted under the supervision of your doctors 
                    or medical staff.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    7.3 Any liability herein will not be more than three (3) months of the aggregate platform fee to be received by Plunes from You for the Services.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    7.4 Neither Plunes nor You will be liable for any indirect, consequential, exemplary, or punitive damages, including lost profits, loss of business, and/ or goodwill.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">7. INDEMNITY</h3>
                <p className="text-[0.7rem] mb-2.5">
                    7.1 You and Plunes agree to defend, indemnify, and hold each other harmless and their officers, directors, employees, and agents from and against any and all liabilities, claims, 
                    suits, losses, damages, costs, fees and expenses (including reasonable attorneys&#39; fees) arising out of or in connection with (a) any non- compliance with applicable laws by 
                    them in performance of their obligations under the Agreement.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    7.2 Plunes will not be held responsible for any medico-legal liability arising from complications in the treatments of patients which is conducted under the supervision of your 
                    doctors or medical staff.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    7.3 Any liability herein will not be more than three (3) months of the aggregate platform fee to be received by Plunes from You for the Services.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    7.4 Neither Plunes nor You will be liable for any indirect, consequential, exemplary, or punitive damages, including lost profits, loss of business, and/ or goodwill.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">8. SOFTWARE</h3>
                <p className="text-[0.7rem] mb-2.5">
                    We may include software for use in connection with our Services. If such software is accompanied by an end user licence agreement (&#39;EULA&#39;), the terms of the EULA will govern your 
                    use of the software. If such software is not accompanied by a EULA, then We grant to You a non-exclusive, revocable, personal, and non-transferable licence to use such software solely 
                    in connection with our Services and in accordance with these Terms of Use. Any software and any related documentation is provided &#39;AS IS&#39; without warranty of any kind, either 
                    express or implied, including, without limitation, the implied warranties of merchantability, fitness for a particular purpose, or non-infringement. You accept any and all risk arising 
                    out of use or performance of any software. You may not reproduce or redistribute any software except in accordance with the EULA or these Terms of Use.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">9. CONFIDENTIALITY</h3>
                <p className="text-[0.7rem] mb-2.5">
                    9.1 &quot;Confidential Information&quot; means any non-public information, data, or materials disclosed by either Party (Plunes or You) to the other Party in connection with these 
                    Terms of Use, whether orally, in writing, or in electronic form. Confidential Information includes, but is not limited to, proprietary business information, financial data, technical 
                    know-how, trade secrets, intellectual property, user/patient records, operational processes, marketing strategies, and any information marked as &#39;confidential&#39; or disclosed 
                    under circumstances that reasonably indicate its confidential nature.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    9.2 During the term of use of the Portal and the Services, and thereafter, the Parties (“Receiving Party”) shall treat as confidential and shall not disclose to any third party or use 
                    for any purpose other than the performance of its obligations under these Terms of Use, any Confidential Information received from the other Party (“Disclosing Party”). The Parties 
                    shall take reasonable measures to protect Confidential Information from unauthorized use or disclosure.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    9.3 Notwithstanding the foregoing, the Parties may disclose Confidential Information to its employees, agents, contractors, and advisors who have a legitimate need to know such 
                    information for the purpose of carrying out the obligations under these Terms of Use, provided that such persons are bound by confidentiality obligations no less restrictive 
                    than those set forth in these Terms of Use.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    9.4 The obligations of confidentiality shall not apply to Confidential Information that: (a) is or becomes publicly available through no fault of the Receiving Parties; (b) was lawfully 
                    in the possession of the Receiving Party prior to disclosure by the Disclosing Party; (c) is rightfully obtained by the Receiving Party from a third-party without breach of any 
                    confidentiality obligation; or (d) is independently developed by the receiving Party without use of the Disclosing Party’s Confidential Information.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    9.5 Upon the written request of the Disclosing Party, or upon the termination of your access to the Services and/or the Portal, the Receiving Party shall promptly return or destroy 
                    all tangible and electronic copies of the Disclosing Party’s Confidential Information in its possession or control.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    9.6 The Parties acknowledge and agree that a breach or threatened breach of this confidentiality clause may cause irreparable harm to the Disclosing Party, for which monetary damages 
                    alone may not be an adequate remedy. In such cases, the Disclosing Party shall be entitled to seek injunctive relief or equitable remedies in addition to any other remedies available 
                    at law or in equity.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    9.7 The obligations of confidentiality set forth in this paragraph shall survive the termination of your access to the Services and/or the Portal for a period of two (2) years, 
                    except for trade secrets, which shall be protected for as long as they remain trade secrets under applicable law.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">10. MODIFICATIONS AND INTERRUPTIONS</h3>
                <p className="text-[0.7rem] mb-2.5">
                    We cannot guarantee that the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services,
                     resulting in interruptions, delays, or errors. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use 
                     the Services during any downtime for any reason.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">11. GOVERNING LAW</h3>
                <p className="text-[0.7rem] mb-2.5">
                    These Terms of Use shall be governed in all respects by the laws of India and the courts at Delhi, India shall have exclusive jurisdiction.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">12. DISPUTE RESOLUTION</h3>
                <p className="text-[0.7rem] mb-2.5">
                    12.1 In the event a dispute arises in connection with the interpretation or implementation of these Terms of Use, such dispute shall be referred to a mutually appointed sole 
                    arbitrator according to the Arbitration and Conciliation Act, 1996 (India), as amended from time to time, and the rules made thereunder. Arbitration will be conducted in Delhi, 
                    India under governing law stated in paragraph 11 above.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    12.2 All proceedings in any such arbitration shall be conducted in English.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    12.3 The arbitration award shall be final and binding, and You agree to be bound by the award and to act accordingly.
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    12.4 The arbitrator may, (but shall not be required to), award to a party that substantially prevails on merits, its costs, and reasonable expenses (including reasonable fees of its counsel).
                </p>
                <p className="text-[0.7rem] mb-2.5">
                    12.5 When any dispute is under arbitration, except for the matters under dispute, both Plunes and You will continue to exercise their remaining respective rights and fulfil their 
                    remaining respective obligations under these Terms of Use.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">13. CORRECTIONS</h3>
                <p className="text-[0.7rem] mb-2.5">
                    There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other 
                    information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">14. USER DATA</h3>
                <p className="text-[0.7rem] mb-2.5">
                    We will maintain certain data that You transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. 
                    Although we perform regular routine backups of data, You are solely responsible for all data that You transmit or that relates to any activity You have undertaken using the Services. 
                    You agree that we shall have no liability to You for any loss or corruption of any such data, and You hereby waive any right of action against us arising from any such loss or 
                    corruption of such data.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">15. MISCELLANEOUS</h3>
                <p className="text-[0.7rem] mb-2.5">
                    These Terms of Use and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between 
                    You and us. Our failure to exercise or enforce any right or provision of these Terms of Use shall not operate as a waiver of such right or provision. These Terms of Use operate 
                    to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, 
                    damage, delay, or failure to act caused by any cause beyond our reasonable control. If any provision or part of a provision of these Terms of Use is determined to be unlawful, 
                    void, or unenforceable, that provision or part of the provision is deemed severable from these Terms of Use and does not affect the validity and enforceability of any remaining 
                    provisions. There is no joint venture, partnership, employment or agency relationship created between You and us as a result of these Terms of Use or use of the Services. 
                    You hereby waive any and all defences You may have based on the electronic form of these Terms of Use and the lack of signing by the parties hereto to execute these Terms of Use.
                </p>

                <h3 className="text-[0.8rem] font-semibold mb-2.5 mt-4 text-left">16. CONTACT US</h3>
                <p className="text-[0.7rem] mb-2.5">In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:</p>
                <p className="text-[0.7rem] text-left"><b>Email</b>: hospitalsupport@plunes.com</p>
                <p className="text-[0.7rem] text-left"><b>Phone Number</b>: +91-9354 277 013</p>
                <p className="text-[0.7rem] mb-[1.5rem] text-left"><b>Address</b>: Plot no. 90B, Delhi - Jaipur Expressway, Sector 18, Gurugram, Haryana 122008</p>

                {/* Check box + input here */}
                <div className="flex items-start gap-4 mb-[1.5rem]">
                    <Checkbox size="xs" radius={4} checked={termsChecked} onChange={e => setTermsChecked(e.target.checked)} 
                        classNames={{ 
                            input: "!cursor-pointer",
                            root: "mt-[0.5rem]"
                        }}
                    />
                    <>
                        <p className="m-0 font-semibold text-[0.7rem] leading-[1.75rem] text-left">
                            <span className="break-words">
                                I{" "}
                                <TextInput size="xs" radius={4}
                                    value={postData?.hospitalDetails?.representativeName}
                                    onChange={(e) => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, representativeName: e.target.value}})}
                                    placeholder="Name *"
                                    classNames={{
                                        input: '!bg-[#F4F4F4] border-1 !border-[#D4D4D4] w-[10rem] !min-h-[1rem] inline-block',
                                        wrapper: 'w-[10rem]',
                                        root: '!w-[10rem] inline-block mb-[0.5rem] md:mb-0 ml-1'
                                    }}
                                />
                                , working as{" "}
                                <TextInput size="xs" radius={4}
                                    value={postData?.hospitalDetails?.representativeDesignation}
                                    onChange={(e) => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, representativeDesignation: e.target.value}})}
                                    placeholder="Designation *"
                                    classNames={{
                                        input: '!bg-[#F4F4F4] border-1 !border-[#D4D4D4] w-[10rem] !min-h-[1rem] inline-block',
                                        wrapper: 'w-[10rem]',
                                        root: '!w-[10rem] inline-block mb-[0.5rem] md:mb-0 mx-1'
                                    }}
                                />
                                {" "}in{" "}
                                <span className="bg-[#F4F4F4] border border-[#D4D4D4] rounded-[0.25rem] py-[0.25rem] px-[0.5rem] text-[#C8C8C8] ml-1">
                                    {postData?.name ? postData?.name : "-"}
                                </span>
                                , hereby declare that I have read, understood, and agree to abide by all the aforementioned Terms & Conditions.<span className="text-red-500">*</span>
                            </span>
                        </p>
                    </>
                </div>

                <p className="text-[#3E97FF] text-[0.7rem] mb-[3rem]">(* This field is mandatory)</p>

                <div className="flex justify-end">
                    <Button size="xs" bg={"#00A82E"} radius={4} w={100} h={32}
                        classNames={{
                            root: "mb-2",
                            label: "!text-[0.8rem] !font-medium"
                        }}
                        onClick={()=>handleNext()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </>
        {docUrl && <ViewDocModal url={docUrl} setUrl={setDocUrl}/>}
        </>
    )
}

export default TermsAndCondition