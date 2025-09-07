import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { View } from "react-native";
import {
	Toast,
	ToastDescription,
	ToastTitle,
	useToast,
} from "@/components/ui/toast";

const HomeScreen = () => {
	const toast = useToast();
	const [toastId, setToastId] = useState(0);
	const handleToast = () => {
		if (!toast.isActive(toastId.toString())) {
			showNewToast();
		}
	};
	const showNewToast = () => {
		const newId = Math.random();
		setToastId(newId);
		toast.show({
			id: newId.toString(),
			placement: "top",
			duration: 3000,
			render: ({ id }) => {
				const uniqueToastId = "toast-" + id;
				return (
					<Toast
						nativeID={uniqueToastId}
						action="muted"
						variant="solid"
					>
						<ToastTitle>Hello!</ToastTitle>
						<ToastDescription>
							This is a customized toast message.
						</ToastDescription>
					</Toast>
				);
			},
		});
	};
	return (
		<View>
			<Heading size={"1xl"}>
				Open up App.tsx to start working on your app!
			</Heading>

			<Button onPress={handleToast}>
				<ButtonText>Press Me</ButtonText>
			</Button>

			<StatusBar style="auto" />
		</View>
	);
};

export default HomeScreen;
