// class ReadRequirement {
//   text: string[];
//   isValid: boolean;
//   constructor(text: string) {
//     this.text = this.splitSentence(text);
//     this.isValid = this.checkIsValid();
//   }

//   private splitSentence(text: string) {
//     return text.map((el) =>
//       el
//         .text()
//         .trim()
//         .split(' ')
//         .filter((el) => !!el)
//     );
//   }
//   checkIsValid() {
//     return true;
//   }
// }
