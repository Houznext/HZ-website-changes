import React from "react";
import { Container } from "@mui/material";
import withUserLayout from "@/components/Layouts/UserLayout";
import AccessControl from "@/components/AccessControl";

const AccessControlPage = () => {
  return (
    <Container maxWidth="xl" style={{ background: "#f8f9ff" }}>
      <AccessControl
        tables={[
          {
            id: 1,
            title: "test 1",
            create: true,
            update: true,
            delete: false,
            read: true,
          },
          {
            id: 2,
            title: "test 2",
            create: false,
            update: true,
            delete: true,
            read: true,
          },
          {
            id: 3,
            title: "test 3",
            create: true,
            update: false,
            delete: false,
            read: true,
          },
          {
            id: 4,
            title: "test 4",
            create: true,
            update: true,
            delete: false,
            read: false,
          },
          {
            id: 5,
            title: "test 5",
            create: false,
            update: false,
            delete: true,
            read: true,
          },
          {
            id: 6,
            title: "test 6",
            create: true,
            update: false,
            delete: true,
            read: false,
          },
          {
            id: 7,
            title: "test 7",
            create: false,
            update: true,
            delete: false,
            read: true,
          },
          {
            id: 8,
            title: "test 8",
            create: true,
            update: true,
            delete: true,
            read: false,
          },
          {
            id: 9,
            title: "test 9",
            create: false,
            update: false,
            delete: false,
            read: true,
          },
          {
            id: 10,
            title: "test 10",
            create: true,
            update: false,
            delete: true,
            read: true,
          },
          {
            id: 11,
            title: "test 11",
            create: false,
            update: true,
            delete: false,
            read: false,
          },
          {
            id: 12,
            title: "test 12",
            create: true,
            update: true,
            delete: false,
            read: true,
          },
          {
            id: 13,
            title: "test 13",
            create: false,
            update: true,
            delete: true,
            read: true,
          },
          {
            id: 14,
            title: "test 14",
            create: true,
            update: false,
            delete: false,
            read: true,
          },
          {
            id: 15,
            title: "test 15",
            create: false,
            update: false,
            delete: true,
            read: false,
          },
        ]}
      />
    </Container>
  );
};

export default withUserLayout(AccessControlPage);
