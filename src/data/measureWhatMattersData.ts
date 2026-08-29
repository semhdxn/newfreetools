// Measure What Matters — global criteria bank (exported from the live database).
// MWM is *builder-based*: a user composes a questionnaire by picking criteria
// from this bank; each criterion carries ~5 statements scored 1-5 (Likert).
export interface MwmStatement { id: string; text: string; sortOrder: number; }
export interface MwmCriteria { id: string; name: string; description: string | null; statements: MwmStatement[]; }

export const measureWhatMattersCriteria: MwmCriteria[] = [
  {
    "id": "0e8ebdff-9481-4bc9-b739-6ff3049ec81c",
    "name": "Accepting Feedback",
    "description": null,
    "statements": [
      {
        "id": "cc1cf584-75b8-48d6-a8a4-2a8457d8e017",
        "text": "Listens to feedback without becoming defensive",
        "sortOrder": 1
      },
      {
        "id": "cf63d803-ff7e-4be5-b757-05b96f44953a",
        "text": "Makes changes based on feedback given",
        "sortOrder": 2
      },
      {
        "id": "12dcb751-1581-4096-8b8a-da0576c4609a",
        "text": "Asks questions to understand feedback",
        "sortOrder": 3
      },
      {
        "id": "a61fc922-1d8d-40cf-80a6-c19bc4fb91d9",
        "text": "Thanks/acknowledges the person giving feedback",
        "sortOrder": 4
      },
      {
        "id": "044b704e-3135-445e-9b54-27959bb8d92c",
        "text": "Applies feedback to future tasks",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "fc3aac9f-0791-4221-aa4b-75ff7fcb84de",
    "name": "Asking for Help",
    "description": null,
    "statements": [
      {
        "id": "b79328df-12d4-48cf-be41-a450e7a7829f",
        "text": "Recognises when they need help",
        "sortOrder": 1
      },
      {
        "id": "a754191e-6da9-44e5-9d38-00884ac659bd",
        "text": "Asks an adult/peer for help appropriately",
        "sortOrder": 2
      },
      {
        "id": "2bb08243-a6f8-460a-9026-412b8237736b",
        "text": "Tries independently before asking",
        "sortOrder": 3
      },
      {
        "id": "22151bad-9223-496a-9201-455f895f60ad",
        "text": "Accepts help when offered",
        "sortOrder": 4
      },
      {
        "id": "c030708b-4246-42fc-bd46-f85b5dec6a53",
        "text": "Uses help to complete the task, not avoid it",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "09ea209e-4a64-4ac7-8443-86fc5eeef675",
    "name": "Attending school",
    "description": null,
    "statements": [
      {
        "id": "334a380b-776c-4cc8-baea-ee50fe809443",
        "text": "Attends school",
        "sortOrder": 1
      },
      {
        "id": "f1294d80-61e8-4d6c-8ef8-4a54d7c42fca",
        "text": "Arrives ready to learn",
        "sortOrder": 2
      },
      {
        "id": "2f01147d-3821-4982-a156-3a3114de97ca",
        "text": "Communicates reasons for absence appropriately",
        "sortOrder": 3
      },
      {
        "id": "74b95cb4-40a3-4188-8118-70b1b9a367d2",
        "text": "Shows willingness to come to school",
        "sortOrder": 4
      },
      {
        "id": "f8fb358a-332d-47ab-bbe5-3a7d5ed0e22f",
        "text": "Engages with attendance support when offered",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "e449dcce-1ec1-425d-82a8-09cad68e7703",
    "name": "Building Friendships",
    "description": null,
    "statements": [
      {
        "id": "1a88fe96-585e-47dd-9996-682ebe76a225",
        "text": "Initiates play/conversation with peers",
        "sortOrder": 1
      },
      {
        "id": "178eb86e-6bf5-431c-bace-8cda1afce285",
        "text": "Maintains a friendship over time",
        "sortOrder": 2
      },
      {
        "id": "53ee8a60-841d-4ff3-849d-498aff715fce",
        "text": "Repairs friendships after a falling out",
        "sortOrder": 3
      },
      {
        "id": "338d6e67-8b17-48c6-99f4-99f1c079934a",
        "text": "Shows loyalty/support to friends",
        "sortOrder": 4
      },
      {
        "id": "75f3c5a1-1d7a-4c4f-9fc8-a79d7a9deb48",
        "text": "Chooses positive friendships",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "5864c762-062c-4904-aa1a-03accb85d21f",
    "name": "Completing homework",
    "description": null,
    "statements": [
      {
        "id": "a18ff0ec-ff6b-4fad-ac11-2a19528235b4",
        "text": "Completes homework by the deadline",
        "sortOrder": 1
      },
      {
        "id": "b4e96b93-11eb-4a19-be4a-0115e070910e",
        "text": "Completes homework to a reasonable standard",
        "sortOrder": 2
      },
      {
        "id": "f8a784a3-9c3a-45ef-b93f-4789f88795a6",
        "text": "Brings homework equipment/materials needed",
        "sortOrder": 3
      },
      {
        "id": "5cd14be6-808c-4802-9dec-bac4f4bd7926",
        "text": "Asks for help with homework when needed",
        "sortOrder": 4
      },
      {
        "id": "339d52a8-8d4a-42d1-b59c-a51f83ac8fbb",
        "text": "Shows effort/engagement in homework tasks",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "6833b0a1-bb05-4761-af63-a9753ce422aa",
    "name": "Confidence & Self-Esteem",
    "description": null,
    "statements": [
      {
        "id": "0816803d-f97c-488c-b347-cb8d23bf352b",
        "text": "Volunteers answers/ideas in class",
        "sortOrder": 1
      },
      {
        "id": "6766a1c8-8064-4388-b8c5-009ed9fd2350",
        "text": "Tries new activities without excessive reassurance",
        "sortOrder": 2
      },
      {
        "id": "4f7a4864-7554-436c-a016-e5c88a3bb981",
        "text": "Speaks in front of a small group",
        "sortOrder": 3
      },
      {
        "id": "d168cbda-7601-42ad-8ddf-d96d6028dbb6",
        "text": "Shows pride in their own achievements",
        "sortOrder": 4
      },
      {
        "id": "41f6736d-6dee-4a23-901a-08a4bd1de96b",
        "text": "Recovers confidence quickly after a mistake",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "7f647c43-6def-4895-a9fe-20845125553b",
    "name": "Conflict Resolution",
    "description": null,
    "statements": [
      {
        "id": "e9930268-37ff-45b9-b6bb-9cf8869ab684",
        "text": "Resolves disagreements without adult intervention",
        "sortOrder": 1
      },
      {
        "id": "03ed1cc6-d6bd-4931-87f4-2c401b6b9e98",
        "text": "Uses compromise to solve a conflict",
        "sortOrder": 2
      },
      {
        "id": "18e5ce60-4eb1-40be-8857-ba5ee769523b",
        "text": "Apologises when they have caused upset",
        "sortOrder": 3
      },
      {
        "id": "8b25f8d7-1774-4e9e-81a6-9d5ae4998124",
        "text": "Accepts an apology from others",
        "sortOrder": 4
      },
      {
        "id": "0509e4e2-18f7-452a-8877-6c39d40f5eb1",
        "text": "Moves on from conflict without holding a grudge",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "e2a8c590-8042-4abd-8f6c-51706e6acc2b",
    "name": "Emotional Awareness",
    "description": null,
    "statements": [
      {
        "id": "7ef46bef-ab13-4196-b564-b7c178254e59",
        "text": "Names their own emotions accurately",
        "sortOrder": 1
      },
      {
        "id": "7edafd9c-81aa-480c-83e3-58472166c717",
        "text": "Recognises what triggers strong feelings",
        "sortOrder": 2
      },
      {
        "id": "1fb6d79f-bdd9-4b63-8cd6-e3baa0a8aabe",
        "text": "Talks about feelings with a trusted adult",
        "sortOrder": 3
      },
      {
        "id": "96b5ea5d-5b84-451d-b716-a0f8685ee994",
        "text": "Notices emotional changes in the moment",
        "sortOrder": 4
      },
      {
        "id": "382aa1ba-e98a-400c-b940-b466c4110141",
        "text": "Uses an emotion scale/check-in tool independently",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "be77467c-2191-4bee-817b-b4162e2fc758",
    "name": "Following instructions",
    "description": null,
    "statements": [
      {
        "id": "10222d39-40bb-48ba-aefd-4d0587c65944",
        "text": "Follows single-step instructions independently",
        "sortOrder": 1
      },
      {
        "id": "9901ea80-4db9-4c50-8384-216e88d542b1",
        "text": "Follows multi-step instructions without needing them repeated",
        "sortOrder": 2
      },
      {
        "id": "ea47df6c-2cd5-4a20-b008-6f226bbfa1c9",
        "text": "Follows instructions from unfamiliar adults",
        "sortOrder": 3
      },
      {
        "id": "9eab171d-a833-4fcc-975f-3251ce4ac96b",
        "text": "Follows instructions promptly without argument",
        "sortOrder": 4
      },
      {
        "id": "c798f182-682d-4ae8-9bfc-e6d2c5e0f314",
        "text": "Checks understanding if an instruction is unclear",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "3dccf59b-1cfe-4104-87c8-f537aae04e2c",
    "name": "Healthy eating",
    "description": null,
    "statements": [
      {
        "id": "ba823b1f-06c7-4ea7-b5db-24bec8e97dd5",
        "text": "Eats a balanced meal at lunchtime",
        "sortOrder": 1
      },
      {
        "id": "a6a07e2f-efe5-4818-a2f1-3e0fa4774861",
        "text": "Brings/chooses healthy food options",
        "sortOrder": 2
      },
      {
        "id": "949e0a3d-4ceb-4e09-b126-53893f3ef824",
        "text": "Eats breakfast before school",
        "sortOrder": 3
      },
      {
        "id": "642a0b0d-3ddf-4a90-a4b4-b8b76f8d6f60",
        "text": "Shows understanding of healthy eating choices",
        "sortOrder": 4
      },
      {
        "id": "626f5e12-3615-45ac-a537-9dc9438cfc62",
        "text": "Has a positive relationship with food/mealtimes",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "69448364-cb15-4098-aa1c-3b1d6b8b438c",
    "name": "Kindness",
    "description": null,
    "statements": [
      {
        "id": "4f322545-ddb2-4930-9624-986f217a8dbf",
        "text": "Shows kindness to peers without being prompted",
        "sortOrder": 1
      },
      {
        "id": "db68068b-2dde-4c30-9ac8-bf1a4eba3caa",
        "text": "Offers to help others when they notice someone struggling",
        "sortOrder": 2
      },
      {
        "id": "2e1ea514-90bd-470d-8730-36fa206fc1c8",
        "text": "Speaks positively about classmates",
        "sortOrder": 3
      },
      {
        "id": "0e26539e-986e-4f26-8831-976e4c8ece55",
        "text": "Includes others who may be left out",
        "sortOrder": 4
      },
      {
        "id": "681cecbc-f839-43e9-a92a-cbafc13ed14d",
        "text": "Responds gently when someone is upset",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "097477d1-287d-46c1-853e-109bab168349",
    "name": "Lesson attendance",
    "description": null,
    "statements": [
      {
        "id": "1f0e9ea3-4a8d-4928-9a4e-4fbc8b177c25",
        "text": "Attends timetabled lessons",
        "sortOrder": 1
      },
      {
        "id": "6534fd02-4609-4f93-9465-3ceb20849f24",
        "text": "Attends lessons promptly",
        "sortOrder": 2
      },
      {
        "id": "c3311d56-8a46-44dd-8376-313e0145f02b",
        "text": "Attends lessons without needing reminders",
        "sortOrder": 3
      },
      {
        "id": "7a26838b-d87d-4247-b290-c27c55e29bf8",
        "text": "Engages positively once in the lesson",
        "sortOrder": 4
      },
      {
        "id": "ee750dc2-5c96-4ee3-8dfa-4936cfea0463",
        "text": "Communicates in advance if unable to attend",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "2029bfef-a084-428f-9b6b-56a99338d7f4",
    "name": "Listening to others",
    "description": null,
    "statements": [
      {
        "id": "deddb64f-2189-4b09-a0b1-63fb98530c37",
        "text": "Makes eye contact/attends when spoken to",
        "sortOrder": 1
      },
      {
        "id": "d8d2d40d-786c-4994-aefd-58795bbfdb57",
        "text": "Waits for their turn to speak",
        "sortOrder": 2
      },
      {
        "id": "2fecc4e4-ca04-467a-b6a4-348ad0b9699e",
        "text": "Listens without needing information repeated",
        "sortOrder": 3
      },
      {
        "id": "62db5be2-bd93-4dd8-b751-49b534568761",
        "text": "Responds relevantly to what others have said",
        "sortOrder": 4
      },
      {
        "id": "b4d47525-0b20-4780-af3b-73b536978379",
        "text": "Listens without interrupting",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "fc3d9fb4-2b5a-484a-81a5-0384a6d8cbbc",
    "name": "Maintaining Routines",
    "description": null,
    "statements": [
      {
        "id": "cac661ac-4511-4046-bdfc-e5af72262648",
        "text": "Follows the daily school routine",
        "sortOrder": 1
      },
      {
        "id": "951fbfa3-04ea-40d4-900f-bac8352a0f0c",
        "text": "Transitions between activities smoothly",
        "sortOrder": 2
      },
      {
        "id": "8884bdaf-abd7-4469-9e2f-1b7ca8d2a1c2",
        "text": "Prepares for lessons/activities without reminders",
        "sortOrder": 3
      },
      {
        "id": "597685ff-82b7-4f37-a90b-52b31085ac49",
        "text": "Copes well when routines change slightly",
        "sortOrder": 4
      },
      {
        "id": "6a7ed528-9081-474d-91e7-a56deeadb4b8",
        "text": "Maintains routines at home as well as school",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "1f707fa1-2df6-4151-a893-60a95ac3796a",
    "name": "Maintaining uniform standards",
    "description": null,
    "statements": [
      {
        "id": "58de5cac-8dd8-4e69-ba59-9554a6a22e64",
        "text": "Wears correct uniform",
        "sortOrder": 1
      },
      {
        "id": "88e74a15-3864-48c2-bbd2-59a98123ed92",
        "text": "Uniform is clean and in good condition",
        "sortOrder": 2
      },
      {
        "id": "ee335770-d31c-4c31-b343-9bf2779ea884",
        "text": "Wears uniform correctly (e.g. tie, shoes)",
        "sortOrder": 3
      },
      {
        "id": "b3cdbe6c-5316-4397-8fdf-14c8322f92b1",
        "text": "Takes pride in their appearance",
        "sortOrder": 4
      },
      {
        "id": "6201507e-161d-42e6-91bf-f72efcb4e72b",
        "text": "Resolves uniform issues without conflict",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "1ecf7d5f-1c3d-4ffd-807a-56619c1472bc",
    "name": "Managing Anger",
    "description": null,
    "statements": [
      {
        "id": "703a4b2a-30a6-480d-8819-5793e7885b13",
        "text": "Recognises early signs of anger",
        "sortOrder": 1
      },
      {
        "id": "67310996-5f5f-4007-a17f-ab15d861b7c2",
        "text": "Removes themselves from a situation before escalation",
        "sortOrder": 2
      },
      {
        "id": "e3e1778d-4d51-4d88-94c3-bb89c3c92fbc",
        "text": "Uses words rather than actions when angry",
        "sortOrder": 3
      },
      {
        "id": "74c4e927-e048-42be-bdf5-d79f95629c86",
        "text": "Accepts consequences calmly",
        "sortOrder": 4
      },
      {
        "id": "7585a2b2-f474-4c22-9fac-222be5ca056b",
        "text": "Repairs relationships after an angry outburst",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "9c3f98c6-6d21-47b1-b8b0-45cdbfacc487",
    "name": "Managing Anxiety",
    "description": null,
    "statements": [
      {
        "id": "1621d6be-ee28-4bd7-9c35-2f3a586ea4b8",
        "text": "Uses a coping strategy when anxious",
        "sortOrder": 1
      },
      {
        "id": "20c16397-f5b5-4148-8951-9b1d2acefe39",
        "text": "Communicates worries to a trusted adult",
        "sortOrder": 2
      },
      {
        "id": "f525ccf4-e97d-4eeb-a784-e982765d057c",
        "text": "Attends anxiety-provoking situations (e.g. assemblies) with support",
        "sortOrder": 3
      },
      {
        "id": "1c90335f-eca7-403a-a9af-e5aebb54b283",
        "text": "Shows reduced physical signs of anxiety",
        "sortOrder": 4
      },
      {
        "id": "2a081e94-ccd1-4e13-af6c-d454b356de28",
        "text": "Recovers quickly after an anxious episode",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "fa7e028d-ae5f-4abb-b5e9-441be7d1c472",
    "name": "Missing Episodes",
    "description": null,
    "statements": [
      {
        "id": "0075f97e-bf75-4f8d-b402-c71c4063a6f0",
        "text": "Attends school as expected",
        "sortOrder": 1
      },
      {
        "id": "c670dfa4-09aa-4f1a-a563-2364f6b21b90",
        "text": "Communicates whereabouts to trusted adults",
        "sortOrder": 2
      },
      {
        "id": "0f6ab7b8-0bad-4ceb-97f9-c05f1691a42e",
        "text": "Returns home/school on time after activities",
        "sortOrder": 3
      },
      {
        "id": "bac74e06-0c1e-4e55-b56f-e558f493c27e",
        "text": "Engages with support around known risk times",
        "sortOrder": 4
      },
      {
        "id": "48e5db7d-daaf-4ce1-b3f5-242815ba5098",
        "text": "Shows increasing trust in relationships with staff/carers",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "aeb4e284-9e70-4b51-be8d-bdc854e8a640",
    "name": "Organisational Skills",
    "description": null,
    "statements": [
      {
        "id": "e7442598-c848-4063-984c-3a995616e366",
        "text": "Brings correct equipment to lessons",
        "sortOrder": 1
      },
      {
        "id": "0322773b-425e-40a6-8f57-61e0f2f28cdc",
        "text": "Keeps track of their own belongings",
        "sortOrder": 2
      },
      {
        "id": "425eaa5c-6858-4066-9518-271728ddab72",
        "text": "Manages their own school bag/locker",
        "sortOrder": 3
      },
      {
        "id": "d14118e0-e99d-4e74-af20-0f49ad570889",
        "text": "Plans ahead for deadlines/events",
        "sortOrder": 4
      },
      {
        "id": "31357340-d974-4146-bcbe-fb0de0b882f7",
        "text": "Uses a planner/reminder system independently",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "855c7daa-2b1a-4f13-9108-8ce0cef03c5f",
    "name": "Overcoming specific difficulty",
    "description": null,
    "statements": [
      {
        "id": "494b102e-942a-4edb-bdf3-0645e2e2295c",
        "text": "Attempts tasks they find difficult",
        "sortOrder": 1
      },
      {
        "id": "11749aa5-5a64-4ef8-a00e-5f001ecb4072",
        "text": "Uses strategies taught to manage the difficulty",
        "sortOrder": 2
      },
      {
        "id": "2807b943-3a20-4603-9ddd-469d2b45decd",
        "text": "Asks for help appropriately when stuck",
        "sortOrder": 3
      },
      {
        "id": "929b230a-84d3-4df0-8de8-5f0798ebb099",
        "text": "Shows resilience after setbacks",
        "sortOrder": 4
      },
      {
        "id": "6ac186a8-5708-436c-b421-952c198a2de8",
        "text": "Recognises their own progress over time",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "6a7b9fcc-869d-45ac-99bf-6db62b61a528",
    "name": "Personal Hygiene & Self-Care",
    "description": null,
    "statements": [
      {
        "id": "7bf8460b-e09a-4caa-b38e-b4d386473349",
        "text": "Attends school in clean, appropriate clothing",
        "sortOrder": 1
      },
      {
        "id": "31068b58-4775-4c65-bbfa-129fb5268777",
        "text": "Manages basic self-care independently",
        "sortOrder": 2
      },
      {
        "id": "af06f103-6493-422a-8e53-afe3ad6a20ff",
        "text": "Shows awareness of personal hygiene routines",
        "sortOrder": 3
      },
      {
        "id": "98dc2b7b-ab56-4885-b1e9-efe5af9a1d03",
        "text": "Takes pride in their personal presentation",
        "sortOrder": 4
      },
      {
        "id": "2c42f26f-dd10-4236-b694-caba3e5ce114",
        "text": "Communicates self-care needs to an adult",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "989831c6-353b-4981-a357-e8677ccac228",
    "name": "Physical Activity & Movement",
    "description": null,
    "statements": [
      {
        "id": "aa03c55a-eb85-4198-a9fb-7006af4239ab",
        "text": "Participates in PE/physical activity",
        "sortOrder": 1
      },
      {
        "id": "9d4143d8-8212-4a09-9bdf-abc4e1d65ced",
        "text": "Shows enjoyment during physical activity",
        "sortOrder": 2
      },
      {
        "id": "0e382404-03ca-498d-beed-b341bac44b2a",
        "text": "Uses movement breaks appropriately when offered",
        "sortOrder": 3
      },
      {
        "id": "b4b42680-0c88-4e39-aae8-287c57a6ef1c",
        "text": "Engages in active play during breaks",
        "sortOrder": 4
      },
      {
        "id": "d5937390-9f4a-4057-88e1-fdabfd44d870",
        "text": "Shows improved stamina/participation",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "5b96e9f4-e654-4422-8772-e77f6154272e",
    "name": "Punctuality",
    "description": null,
    "statements": [
      {
        "id": "0c713584-dfa1-46af-9aa1-c8f7b34dfeae",
        "text": "Arrives to school on time",
        "sortOrder": 1
      },
      {
        "id": "c2a2e41a-6719-4935-95a4-c916af494457",
        "text": "Arrives to lessons on time",
        "sortOrder": 2
      },
      {
        "id": "8a97ae70-10f1-4873-8d1c-2200fa87e01a",
        "text": "Is ready to start work when the lesson begins",
        "sortOrder": 3
      },
      {
        "id": "92f9c9af-482f-4923-9c6c-6c3b4c2fc1a7",
        "text": "Returns from breaks/lunch on time",
        "sortOrder": 4
      },
      {
        "id": "8ba28fe0-3dbd-4667-8b05-4201379ecb14",
        "text": "Manages their own time without reminders",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "f6ad56e0-a8e5-43bc-89dd-947d0f49db6c",
    "name": "Respecting Boundaries & Authority",
    "description": null,
    "statements": [
      {
        "id": "28c91d92-129a-4e66-8ad7-1419cb3ce2fd",
        "text": "Responds appropriately when told \"no\"",
        "sortOrder": 1
      },
      {
        "id": "a0ec8d1c-e7a2-4807-9051-182fd8771b0f",
        "text": "Respects personal space of others",
        "sortOrder": 2
      },
      {
        "id": "520f790d-5a13-4c37-af6e-df9efb36c148",
        "text": "Accepts reasonable instructions from staff",
        "sortOrder": 3
      },
      {
        "id": "2ec52ff3-bbb7-414b-ad10-c7bcfe81e8a5",
        "text": "Follows classroom/school rules",
        "sortOrder": 4
      },
      {
        "id": "c47bb0da-1fc3-46c0-a317-cc207637841e",
        "text": "Responds to correction without escalation",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "30315e1b-89d6-4b28-91c5-2c7dd39cc795",
    "name": "Safe social times",
    "description": null,
    "statements": [
      {
        "id": "f3cdc67b-cf31-4e51-9537-dc2ab1e917a4",
        "text": "Plays/socialises safely with peers",
        "sortOrder": 1
      },
      {
        "id": "3c4662d6-a212-4b5a-9d0a-14553076f809",
        "text": "Avoids risky behaviour during unstructured time",
        "sortOrder": 2
      },
      {
        "id": "a8e6f5ff-c7f9-45d0-95b6-967579e4e7cf",
        "text": "Reports unsafe situations to an adult",
        "sortOrder": 3
      },
      {
        "id": "d794e690-4d50-4d29-8ec8-4267469bad5a",
        "text": "Resolves peer conflict without physical response",
        "sortOrder": 4
      },
      {
        "id": "a1ac0651-1e15-414a-84f3-4433f395f6da",
        "text": "Chooses safe areas/activities during breaks",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "f2632f9c-cddd-4e0a-902a-574ac6ab2fa0",
    "name": "Screen Time & Technology Boundaries",
    "description": null,
    "statements": [
      {
        "id": "641f8572-4149-4bbd-85ae-b2ed064857eb",
        "text": "Follows agreed screen time limits",
        "sortOrder": 1
      },
      {
        "id": "06aebbbb-4106-4b03-9f4d-717f9de051c1",
        "text": "Uses devices appropriately during school hours",
        "sortOrder": 2
      },
      {
        "id": "a46c9f97-286d-4da3-aef8-7a6dcebda1ea",
        "text": "Talks about online activity openly with trusted adults",
        "sortOrder": 3
      },
      {
        "id": "f1d40371-8d4e-47f5-a9d5-720b16d9ab40",
        "text": "Shows understanding of online safety",
        "sortOrder": 4
      },
      {
        "id": "2e8b7794-9d18-4a07-a345-8308088b52b9",
        "text": "Copes well when asked to stop using a device",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "409c559f-e574-43ed-848e-fb639576ab88",
    "name": "Self regulation",
    "description": null,
    "statements": [
      {
        "id": "e1b5e444-c23e-4042-8316-3dfe8039018e",
        "text": "Recognises early signs of rising emotions",
        "sortOrder": 1
      },
      {
        "id": "c3ac8bc9-72ac-42f7-95d3-bd6f3fcdb999",
        "text": "Uses a strategy to calm down when upset",
        "sortOrder": 2
      },
      {
        "id": "9265cc4d-1d6e-46a2-be5c-a9dc64f73520",
        "text": "Asks for space or support when needed",
        "sortOrder": 3
      },
      {
        "id": "afe7affa-f8a2-4ae8-b040-65be40563043",
        "text": "Recovers from dysregulation within a reasonable time",
        "sortOrder": 4
      },
      {
        "id": "c0e022f8-f1a5-4f18-946b-0ecf444cd3ed",
        "text": "Manages frustration without harming self/others",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "04f371c8-ae85-40dd-a080-d0ad22ad9087",
    "name": "Showing independence",
    "description": null,
    "statements": [
      {
        "id": "a93ed89f-cb5b-4ba1-b086-7c6bfd0ff97f",
        "text": "Completes tasks without constant supervision",
        "sortOrder": 1
      },
      {
        "id": "e5a844b8-8a95-4a18-9f4c-c95947209cc8",
        "text": "Organises their own equipment/materials",
        "sortOrder": 2
      },
      {
        "id": "039d5533-be50-40e3-903c-646833815e8c",
        "text": "Makes decisions appropriate to their age",
        "sortOrder": 3
      },
      {
        "id": "224879e6-d82b-4de8-af47-6b5d0e1a8090",
        "text": "Seeks help only when genuinely needed",
        "sortOrder": 4
      },
      {
        "id": "f779b510-0afa-4f70-97c1-fc883021df93",
        "text": "Takes responsibility for their own belongings",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "91bf4706-4a1d-4097-9b61-9d6cd713bc33",
    "name": "Sleep & Readiness to Learn",
    "description": null,
    "statements": [
      {
        "id": "ec822839-66db-40c4-afca-83ac778999e7",
        "text": "Arrives at school appearing rested",
        "sortOrder": 1
      },
      {
        "id": "3c282837-139c-4ac6-b380-0c9ec5608cb4",
        "text": "Reports a consistent bedtime routine",
        "sortOrder": 2
      },
      {
        "id": "a60f7168-3e46-4d4d-8763-3d9668b58eee",
        "text": "Stays alert and engaged through the school day",
        "sortOrder": 3
      },
      {
        "id": "4b2801e7-699f-42e9-b285-5754a2890268",
        "text": "Manages tiredness without becoming irritable",
        "sortOrder": 4
      },
      {
        "id": "42f771f6-dea1-48c6-b7ba-c146ba86c942",
        "text": "Communicates sleep difficulties to a trusted adult",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "45edaf36-377d-4a4b-ab0d-b6e4526e4509",
    "name": "Speaking kindly about themselves",
    "description": null,
    "statements": [
      {
        "id": "072be1f8-2eeb-48cd-91c4-ee00517b91dd",
        "text": "Uses positive language about themselves",
        "sortOrder": 1
      },
      {
        "id": "fa41f2c6-7044-41b6-a944-9f6c287cfb9e",
        "text": "Recognises their own strengths",
        "sortOrder": 2
      },
      {
        "id": "5de4210d-dd3f-48ad-aaa8-a240758eba2f",
        "text": "Avoids putting themselves down after mistakes",
        "sortOrder": 3
      },
      {
        "id": "93168c61-394a-4729-ba1e-9bc03af3497d",
        "text": "Accepts compliments/positive feedback",
        "sortOrder": 4
      },
      {
        "id": "eed2fb1c-40ec-4370-ae0b-d74b88f03ed1",
        "text": "Shows self-belief when facing a challenge",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "f94738c3-db76-4239-8f79-c298352215c4",
    "name": "Substance Misuse",
    "description": null,
    "statements": [
      {
        "id": "4a0f8c17-ba2b-4e32-b9ad-0550b5c64db0",
        "text": "Understands the risks associated with substance use",
        "sortOrder": 1
      },
      {
        "id": "8e84b44a-4eaf-4bae-9b89-98e753451757",
        "text": "Makes safe choices when under peer pressure",
        "sortOrder": 2
      },
      {
        "id": "d965df44-97bc-4358-bd88-e87389e641ea",
        "text": "Talks openly with trusted adults about concerns",
        "sortOrder": 3
      },
      {
        "id": "2ba2070e-dade-4a67-a304-ac5c6be36505",
        "text": "Shows no signs of substance use during the school day",
        "sortOrder": 4
      },
      {
        "id": "97fc993e-df07-4947-a78d-04ae5c04fa95",
        "text": "Engages positively with related education/support sessions",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "a83cd95e-2623-4949-a839-1a4fff81c5ed",
    "name": "Transitions Between Activities/Settings",
    "description": null,
    "statements": [
      {
        "id": "a6ff31d0-2296-4597-828f-80f41be1a8e3",
        "text": "Moves between lessons calmly",
        "sortOrder": 1
      },
      {
        "id": "55072649-60d0-41ea-9b65-5d634570c3be",
        "text": "Copes with changes to the timetable",
        "sortOrder": 2
      },
      {
        "id": "1ad043ad-d214-4966-b811-b10325136d99",
        "text": "Prepares for the end of an activity when given warning",
        "sortOrder": 3
      },
      {
        "id": "e209ab7f-59bc-43ea-afc1-fd454c3f5e9e",
        "text": "Manages transitions between school and home",
        "sortOrder": 4
      },
      {
        "id": "61d51cec-3e8b-4c22-b32e-0dc398d65ba3",
        "text": "Adjusts to unfamiliar settings/supply staff",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "c3694235-9ada-4229-a40a-d59dc6e3a94c",
    "name": "Trying their best",
    "description": null,
    "statements": [
      {
        "id": "a87a037a-894b-4ffe-b600-5d287a34d977",
        "text": "Attempts tasks even when challenging",
        "sortOrder": 1
      },
      {
        "id": "9391c0ae-a330-4379-8530-0876478c023b",
        "text": "Persists at the first sign of difficulty",
        "sortOrder": 2
      },
      {
        "id": "284a46fb-f85b-40b6-bbf9-acf9d688cb07",
        "text": "Takes pride in the quality of their work",
        "sortOrder": 3
      },
      {
        "id": "0b215588-0148-4e03-9d2f-aafd09bde865",
        "text": "Seeks feedback and acts on it",
        "sortOrder": 4
      },
      {
        "id": "8adac5cf-961d-4bb0-8d7d-f7521ebfe6c8",
        "text": "Shows visible effort during lessons",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "3f655906-1abe-4c4f-be30-3d4891d9945d",
    "name": "Understanding others",
    "description": null,
    "statements": [
      {
        "id": "79638bd4-04f8-4a75-a650-b40959c1d3c5",
        "text": "Recognises how others might be feeling",
        "sortOrder": 1
      },
      {
        "id": "910e5094-fe21-4d0c-bbab-eda2e10eb74b",
        "text": "Considers other perspectives before reacting",
        "sortOrder": 2
      },
      {
        "id": "c071c619-4ab2-44bb-94bc-e338df2976b4",
        "text": "Responds appropriately to others' emotions",
        "sortOrder": 3
      },
      {
        "id": "b3a511e2-988a-4ee8-8d59-2aabe7427c8e",
        "text": "Adjusts behaviour based on social cues",
        "sortOrder": 4
      },
      {
        "id": "a2065005-9a94-4637-9f0a-7b560ab6d11e",
        "text": "Shows empathy in conversations with peers",
        "sortOrder": 5
      }
    ]
  },
  {
    "id": "d072fcf5-7906-49b1-85ff-52abda487501",
    "name": "Working together",
    "description": null,
    "statements": [
      {
        "id": "a51e5d51-0a1d-46a1-869f-e31fa1cb00f5",
        "text": "Contributes ideas in group tasks",
        "sortOrder": 1
      },
      {
        "id": "aff31781-059c-4e78-b434-57c09fd7350e",
        "text": "Listens to others' input during group work",
        "sortOrder": 2
      },
      {
        "id": "ec8c0df1-4f25-4153-b006-547f54e2f153",
        "text": "Compromises when there's disagreement",
        "sortOrder": 3
      },
      {
        "id": "2efd8f94-c60d-4f06-9191-f055c0abbfa5",
        "text": "Shares resources/materials fairly",
        "sortOrder": 4
      },
      {
        "id": "45e8a09a-6876-4fe1-8b51-40155c15c475",
        "text": "Stays on task during collaborative work",
        "sortOrder": 5
      }
    ]
  }
];
