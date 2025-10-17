"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import {
  useCreateProjectMutation,
  useGetSpecificOrganizationsQuery,
  useGetSpecificProjectsQuery,
} from "../../redux/services/projects/projectApi";
import PrimaryButton from "../ui/PrimaryButton";

interface CreateProjectProps {
  onCreate: (data: { project: string; organization: string }) => void;
}

export default function CreateProject({ onCreate }: CreateProjectProps) {
  const session_id = Cookies.get("token") || "";

  const [mode, setMode] = useState<
    "createNew" | "createExisting" | "selectExisting"
  >("createNew");
  const [organization, setOrganization] = useState("");
  const [project, setProject] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const { data: orgData, isLoading: orgLoading } =
    useGetSpecificOrganizationsQuery(
      { session_id },
      { skip: mode === "createNew" }
    );

  const { data: projectData, isLoading: projectLoading } =
    useGetSpecificProjectsQuery(
      { organization_id: selectedOrgId },
      { skip: !selectedOrgId || mode !== "selectExisting" }
    );

  const [createProjectApi, { isLoading: creating }] =
    useCreateProjectMutation();

  // Shared style for inputs
  const inputStyles = {
    width: "356px",
    height: "56px",
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      border: "1px solid #3EA2FF",
      flexShrink: 0,
      "& fieldset": { border: "none" },
      "&:hover fieldset": { border: "none" },
      "&.Mui-focused": {
        boxShadow: "0 0 0 2px rgba(62, 162, 255, 0.3)",
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: "14px",
      color: "#000",
      fontFamily: "Poppins, sans-serif",
      fontSize: "16px",
      fontWeight: 500,
    },
    "& .MuiSelect-select": {
      color: "#000",
      fontFamily: "Poppins, sans-serif",
      fontSize: "16px",
      fontWeight: 500,
    },
  };

  const handleSubmit = async () => {
    try {
      if (mode === "createNew") {
        if (!organization || !project)
          return toast.error("Please enter organization and project name");

        const response: any = await createProjectApi({
          session_id,
          organization_name: organization,
          project_name: project,
        }).unwrap();

        saveAndNotify(response, organization, project);
      }

      if (mode === "createExisting") {
        if (!orgData?.organizations?.length)
          return toast.error(
            "No organizations found. Please create one first."
          );
        if (!selectedOrgId || !project)
          return toast.error(
            "Please select organization and enter project name"
          );

        const orgName = orgData.organizations.find(
          (o: any) => o.id === selectedOrgId
        )?.organization_name;

        const response: any = await createProjectApi({
          session_id,
          organization_name: orgName,
          project_name: project,
        }).unwrap();

        saveAndNotify(response, orgName, project);
      }

      if (mode === "selectExisting") {
        if (!orgData?.organizations?.length)
          return toast.error(
            "No organizations found. Please create one first."
          );
        if (!selectedOrgId || !selectedProjectId)
          return toast.error("Please select organization and project");

        const orgName = orgData.organizations.find(
          (o: any) => o.id === selectedOrgId
        )?.organization_name;

        const projectName = projectData?.projects.find(
          (p: any) => p.id === selectedProjectId
        )?.project_name;

        localStorage.setItem(
          "currentProject",
          JSON.stringify({
            organization_id: selectedOrgId,
            project_id: selectedProjectId,
          })
        );

        toast.success("Project selected successfully!");

        onCreate({
          organization: orgName,
          project: projectName,
        });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  const saveAndNotify = (
    response: any,
    orgName: string,
    projectName: string
  ) => {
    localStorage.setItem(
      "currentProject",
      JSON.stringify({
        organization_id: response.organization_id,
        project_id: response.project_id,
      })
    );

    toast.success("Project created successfully!");

    onCreate({
      project: projectName,
      organization: orgName,
    });

    setOrganization("");
    setProject("");
    setSelectedOrgId("");
    setSelectedProjectId("");
  };

  return (
    <Card
      sx={{
        width: 600,
        borderRadius: 5,
        p: 3,
        textAlign: "center",
      }}
    >
      <CardContent>
        <Typography
          sx={{
            mb: 2,
            color: "#000",
            textAlign: "center",
            fontFamily: "Poppins, sans-serif",
            fontSize: "30px",
            fontWeight: 600,
          }}
        >
          Project Setup
        </Typography>

        {/* Mode selector */}
        <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
          <RadioGroup
            row
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as any);
              setOrganization("");
              setProject("");
              setSelectedOrgId("");
              setSelectedProjectId("");
            }}
            sx={{
              justifyContent: "flex-start",
              gap: 4,
              flexWrap: "nowrap",
              mt: 2,
              mb: 2,
            }}
          >
            {[
              { value: "createNew", label: "Create New" },
              { value: "createExisting", label: "Create in Existing" },
              { value: "selectExisting", label: "Select Existing" },
            ].map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={
                  <Radio
                    sx={{
                      color: "grey.500",
                      "&.Mui-checked": { color: "#3EA2FF" },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      color: "#000",
                      textAlign: "center",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "16px",
                      fontWeight: 500,
                    }}
                  >
                    {option.label}
                  </Typography>
                }
              />
            ))}
          </RadioGroup>
        </FormControl>

        {/* Create New */}
        {mode === "createNew" && (
          <>
            <TextField
              placeholder="Organization Name"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              sx={inputStyles}
            />

            <TextField
              placeholder="Project Name"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              sx={inputStyles}
            />
          </>
        )}

        {/* Create in Existing */}
        {mode === "createExisting" && (
          <>
            <FormControl sx={inputStyles}>
              <Select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">
                  <em
                    style={{
                      color: "#000",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "16px",
                      fontWeight: 500,
                    }}
                  >
                    Select Organization
                  </em>
                </MenuItem>
                {orgLoading && <MenuItem disabled>Loading...</MenuItem>}
                {orgData?.organizations?.map((org: any) => (
                  <MenuItem
                    key={org.id}
                    value={org.id}
                    sx={{
                      color: "#000",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "16px",
                      fontWeight: 500,
                    }}
                  >
                    {org.organization_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              placeholder="Enter Project Name"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              sx={inputStyles}
            />
          </>
        )}

        {/* Select Existing */}
        {mode === "selectExisting" && (
          <>
            <FormControl sx={inputStyles}>
              <Select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">
                  <em
                    style={{
                      color: "#000",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "16px",
                      fontWeight: 500,
                    }}
                  >
                    Select Organization
                  </em>
                </MenuItem>
                {orgLoading && <MenuItem disabled>Loading...</MenuItem>}
                {orgData?.organizations?.map((org: any) => (
                  <MenuItem
                    key={org.id}
                    value={org.id}
                    sx={{
                      color: "#000",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "16px",
                      fontWeight: 500,
                    }}
                  >
                    {org.organization_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedOrgId && (
              <FormControl sx={inputStyles}>
                <Select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em
                      style={{
                        color: "#000",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "16px",
                        fontWeight: 500,
                      }}
                    >
                      Select Project
                    </em>
                  </MenuItem>
                  {projectLoading && <MenuItem disabled>Loading...</MenuItem>}
                  {projectData?.projects?.map((p: any) => (
                    <MenuItem
                      key={p.id}
                      value={p.id}
                      sx={{
                        color: "#000",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "16px",
                        fontWeight: 500,
                      }}
                    >
                      {p.project_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </>
        )}

        <PrimaryButton
          text="Create Project"
          onClick={handleSubmit}
          loading={creating}
          sx={{ mt: 1, mx: "auto", display: "block" }}
        />
      </CardContent>
    </Card>
  );
}
