import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Container,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { CREATE_CHECKOUT_SESSION } from "../graphQL/mutations";
import { useAuth } from "../hooks/useAuth";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe promise outside of the component
const stripePromise = loadStripe(
  "pk_test_51PmXWDRqZwKQhgXWr7qBZRxFvWTOUD7sNYEF3doDnMYA7QDZfE2ZNgojuzZC715U8l9ObDoHeNkX0Ya5pmX3WKD100qEZ1Rcjp"
);

const Donate = () => {
  const [createCheckoutSession] = useMutation(CREATE_CHECKOUT_SESSION);
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const handleDonation = async (amount) => {
    try {
      const { data } = await createCheckoutSession({
        variables: { amount },
      });

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.createCheckoutSession.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Checkout failed",
        description:
          error.message ||
          "There was an error processing your donation. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      bgGradient="linear(palette.darkgrey, palette.gradcyan, palette.darkgrey)"
      minHeight="100vh"
      py={10}
    >
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="2xl" textAlign="center" color="palette.white">
            Support Tweet Code
          </Heading>
          <Text color="palette.white" textAlign="center">
            Your donation helps us maintain and improve our platform for all
            users.
          </Text>
          <Box
            bg="palette.darkgrey"
            p={6}
            borderRadius="lg"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          >
            <VStack spacing={4}>
              <Text color="palette.white" textAlign="center">
                Choose a donation amount:
              </Text>
              <Button
                colorScheme="red"
                variant="solid"
                onClick={() => handleDonation(1)}
                isDisabled={!isLoggedIn}
                w="full"
              >
                Donate $1
              </Button>
              <Button
                colorScheme="red"
                variant="solid"
                onClick={() => handleDonation(5)}
                isDisabled={!isLoggedIn}
                w="full"
              >
                Donate $5
              </Button>
              <Button
                colorScheme="red"
                variant="solid"
                onClick={() => handleDonation(10)}
                isDisabled={!isLoggedIn}
                w="full"
              >
                Donate $10
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Donate;
