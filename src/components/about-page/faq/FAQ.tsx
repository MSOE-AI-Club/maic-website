import React from "react";
import "./FAQ.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function FAQ() {
  const faqList = [
    {
      question: "Do I need to sign up to attend events?",
      answer:
        "Nope! You can attend events without signing up. However, joining our Teams group lets you stay up to date with event reminders and club announcements.",
    },
    {
      question: "Do I need to be a CS major to join?",
      answer:
        "Not at all! We welcome all majors and experience levels. Our members come from CS, SE, EE, ME, and many other backgrounds. In fact, students from non-CS majors often bring unique perspectives to our research projects—and some of our most successful teams have included them. Plus, it's a great way to add AI experience to your resume, no matter your field.",
    },
    {
      question: "How do I join the club?",
      answer: (
        <>
          You’re welcome to attend any of our events—held every other Thursday from 6:30pm to 7:30pm in the ITC Great Hall. To officially join and get updates, just click{" "}
          <a href="https://teams.microsoft.com/l/team/19%3A1910afef1d1d4e3b9bfd5f7938182f0b%40thread.tacv2/conversations?groupId=8f7bf1ac-c9b6-4bf0-b74a-407f088e74cc&tenantId=4046ceac-fdd3-46c9-ac80-b7c4a49bab70">
            this link
          </a>{" "}
          to join our Teams group.
        </>
      ),
    },
    {
      question: "How do I earn points?",
      answer: (
        <>
          You can earn points by attending events, joining workshops, and participating in research groups. You’ll also get points for solving challenge problems and submitting them to us. For the full breakdown, check out{" "}
          <a href="/points">this webpage</a>.
        </>
      ),
    },
    {
      question: "How do I earn achievements?",
      answer: (
        <>
          Achievements are awarded for completing specific milestones—like attending a set number of events or solving multiple challenge problems. For the full list, visit{" "}
          <a href="/achievements">this webpage</a>.
        </>
      ),
    },
    {
      question: "How do I get on the leaderboard?",
      answer:
        "Earn points to climb the leaderboard—the more you have, the higher you go! If you're missing from the leaderboard, make sure you're in our Teams group and let an e-board member know.",
    },
  ];

  return (
    <div className="faq-container">
      <h1 className="faq-title">Frequently Asked Questions</h1>
      <p className="faq-description">
        Everything you need to know about joining and participating in MAIC!
      </p>
      <div className="faq-list">
        <div className="accordion-container">
          {faqList.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                padding: "8px 16px",
                maxWidth: "80%",
                margin: "0 auto 12px auto",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                transition: "all 0.3s ease",
                "&::before": {
                  display: "none",
                },
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  boxShadow:
                    "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                  transform: "translateY(-2px)",
                },
                "&.Mui-expanded": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  margin: "0 auto 12px auto",
                },
                "& .MuiAccordionSummary-root": {
                  padding: "8px 0",
                },
                "& .MuiAccordionDetails-root": {
                  padding: "0 0 8px 0",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: "16px",
                  padding: "1px",
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  pointerEvents: "none",
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{
                      color: "white",
                      filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))",
                    }}
                  />
                }
                sx={{
                  "& .MuiAccordionSummary-content": {
                    margin: "4px 0",
                  },
                }}
              >
                <Typography
                  className="faq-question"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  paddingTop: "0",
                  paddingBottom: "8px",
                }}
              >
                <Typography
                  className="faq-answer"
                  sx={{
                    color: "white",
                    lineHeight: 1.6,
                    fontSize: "1rem",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FAQ;
