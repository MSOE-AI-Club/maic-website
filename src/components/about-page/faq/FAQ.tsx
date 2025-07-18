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
      question: "Do I need to sign-up to come to events?",
      answer:
        "No, you do not need to sign-up to come to events! However, if you are in our Teams, you'll be able to get notifications about upcoming events and other club news.",
    },
    {
      question: "Do I need to be CS to join?",
      answer:
        "No, you do not need to be a CS major to join! We welcome all majors and all skill levels. We have members from all majors, including CS, SE, EE, ME, and more! In fact, we encourage other majors to join the club to get AI experience on their resumes as AI continues to spread throughout all major industries. Other majors also offer a fresh perspective on research projects, and some of our top-performing groups have included members from other majors!",
    },
    {
      question: "How do I join the club?",
      answer:
        "You can come to any of our events on Thursdays from 6:30pm - 7:30pm in the ITC Great Hall every-other week. Joining our Teams is as easy as clicking this link!",
    },
    {
      question: "How do I get points?",
      answer:
        "You can get points by attending events, participating in workshops, and participating in research groups. You can also get points by completing challenge problems and submitting them to us! For a comprehensive list of how else you can get points, check out this webpage.",
    },
    {
      question: "How do I get achievements?",
      answer:
        "You can get achievements by completing certain tasks, such as attending a certain number of events or completing a certain number of challenge problems. For a comprehensive list of how else you can get achievements, check out this webpage.",
    },
    {
      question: "How do I get on the leaderboard?",
      answer:
        "You can get on the leaderboard by getting points! The more points you have, the higher you are on the leaderboard. If you are not on the leaderboard, please notify an eboard member and ensure you are a member of our Teams.",
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
