import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  // async function testProfiles() {

  //   const { data, error } = await supabase.from("profiles").select("*");

  //   console.log("Data:", data);
  //   console.log("Error:", error);
  // }

  // testProfiles();
  // return <Redirect href={"/login"} />;
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link href={"/login"}>go to register</Link>
    </View>
  );
}
