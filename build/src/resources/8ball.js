// @bun
var __require = import.meta.require;

// src/resources/8ball.json
var response = [
  {
    text: "Absolutely",
    editNegative: !0,
    suffix: [
      ".",
      "...",
      "!"
    ]
  },
  {
    text: "Absolutely not",
    editPositive: !0,
    suffix: [
      ".",
      "...",
      "!"
    ]
  },
  {
    text: "As I see it, no.",
    editPositive: !0
  },
  {
    text: "As I see it, yes.",
    editNegative: !0
  },
  "Ask again later.",
  "Better not tell you now.",
  "Can't you see I'm busy?",
  "Don't bet on it.",
  "Hard to say.",
  "Hmm...",
  "I am not sure.",
  "I do not know.",
  "I don't not know.",
  "i forgor \uD83D\uDC80",
  "I hope.",
  "idk",
  {
    text: "Likely",
    suffix: [
      ".",
      "...",
      "?",
      "!"
    ]
  },
  "In your dreams.",
  "It's a possibility.",
  "Keep an open mind.",
  "Maybe?",
  "Mayhaps?",
  "My sources say no.",
  "My sources say yes.",
  {
    text: "No",
    editPositive: !0,
    suffix: [
      ".",
      "...",
      "!"
    ]
  },
  {
    text: "Nope",
    editPositive: !0,
    suffix: [
      ".",
      "...",
      "!"
    ]
  },
  "Not sure.",
  "Only time will tell.",
  {
    text: "Outlook positive.",
    editNegative: !0
  },
  "Perchance?",
  "Perhaps?",
  "Possibly?",
  "Reply hazy, try again.",
  "That's gonna be a yikes from me.",
  {
    text: "The odds aren't in your favor",
    suffix: [
      ".",
      "..."
    ]
  },
  {
    text: "The signs are unclear",
    suffix: [
      ".",
      "..."
    ]
  },
  {
    text: "The signs point to no",
    editPositive: !0,
    suffix: [
      ".",
      "...",
      "!"
    ]
  },
  {
    text: "The signs point to yes",
    editNegative: !0,
    suffix: [
      ".",
      "...",
      "!"
    ]
  },
  "Try shaking me again, maybe you'll get a different answer.",
  "Uhhh...",
  {
    text: "Unlikely",
    editNegative: !0,
    suffix: [
      ".",
      "...",
      "?"
    ]
  },
  "Unsure.",
  "Well...",
  "Who asked?",
  {
    text: "Yep",
    editNegative: !0,
    suffix: [
      ".",
      "...",
      "!"
    ]
  },
  {
    text: "Yes",
    editNegative: !0,
    suffix: [
      ".",
      "...",
      "!"
    ]
  },
  "You're barking up the wrong tree."
], editPositive = [
  "actually, yeah!",
  "just kidding, definitely!",
  "you know what, totally."
], editNegative = [
  "actually nevermind.",
  "false alarm.",
  "I change my mind, No way.",
  "I take it back.",
  "jk, definitely not.",
  "nevermind, forget it.",
  "oop, apparently not.",
  "scratch that, no.",
  "uh, no.",
  "wait, now that I think about it, no.",
  "wait no.",
  "wait nope."
], _8ball_default = {
  response,
  editPositive,
  editNegative
};
export {
  response,
  editPositive,
  editNegative,
  _8ball_default as default
};
