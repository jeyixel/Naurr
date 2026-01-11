import User from "../models/User.js";

// Add a friend using their friend code
export const addFriend = async (req, res) => {
  try {
    const { friendCode } = req.body;

    const userId = req.userId; // Came from our middleware

    if (!friendCode) return res.status(400).send("Friend code is required");

    // 1. Find the friend (using .lean() for performance if we just read)
    const friendToAdd = await User.findOne({ friendCode });

    if (!friendToAdd) {
      return res.status(404).json({ message: "Invalid Friend Code." });
    }

    // 2. Prevent adding yourself
    if (friendToAdd._id.toString() === userId) {
      return res.status(400).json({ message: "You cannot add yourself." });
    }

    // 3. Check if already friends
    // We fetch the current user to check their friends list
    const currentUser = await User.findById(userId);
    
    if (currentUser.friends.includes(friendToAdd._id)) {
      return res.status(400).json({ message: "User is already in your friend list." });
    }

    // 4. Update BOTH users (Mutual Friendship)
    // We use $addToSet instead of .push to ensure no duplicates at the DB level
    await User.findByIdAndUpdate(userId, { 
        $addToSet: { friends: friendToAdd._id } 
    });
    
    await User.findByIdAndUpdate(friendToAdd._id, { 
        $addToSet: { friends: userId } 
    });

    return res.status(200).json({ 
        message: "Friend added successfully!", 
        friend: {
            id: friendToAdd._id,
            username: friendToAdd.username,
            firstName: friendToAdd.firstName,
            profilePicture: friendToAdd.profilePicture
        }
    });

  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};