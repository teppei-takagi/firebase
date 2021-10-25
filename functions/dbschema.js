let db = {
  users:[
    {
      userId:       "E0V1z1ozOPeDaMvj9QxJ2aCawVW2",
      email: "user03@gmail.com",
      handle: 'user',
      createdAt: "2021-10-22T05:32:49.968Z",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/fb-study-ce91a.appspot.com/o/images%2Fspiderman_homecoming_1635039217343.jpeg?alt=media&token=e9deb4ff-7e64-4e05-915a-711a7ea3628e",
      bio: "I am iron man",
      location: "Tokyo, Japan",
      website: "https://google.com"
    }
  ],
  screams: [
    {
      userHandle: 'user',
      body: 'this is the scream body',
      createdAt: '2021-10-21T01:51:33.924Z',
      likeCount: 5,
      commentCount: 2
    }
  ],
  comments: [
    {
      userHandle: 'user',
      screamId: "E0V1z1ozOPeDaMvj9QxJ2aCawVW2",  
      body: 'nice avatar!',
      createdAt: '2021-10-21T01:51:33.924Z'
    }
  ],
};

const userDetails = {
  // for redux data
  Credentials: {
    userId: "E0V1z1ozOPeDaMvj9QxJ2aCawVW2",
    email: "user03@gmail.com",
    handle: 'user',
    createdAt: "2021-10-22T05:32:49.968Z",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/fb-study-ce91a.appspot.com/o/images%2Fspiderman_homecoming_1635039217343.jpeg?alt=media&token=e9deb4ff-7e64-4e05-915a-711a7ea3628e",
    bio: "I am iron man",
    location: "Tokyo, Japan",
    website: "https://google.com"
  },
  likes: [
    {
      userHandle: 'user',
      screamId: "E0V1z1ozOPeDaMvj9QxJ2aCawVW2",  
    },
    {
      userHandle: 'user',
      screamId: "E0V1z1ozOPeDaMvj9QxJ2aCawVW2",  
    }
  ]
  
}